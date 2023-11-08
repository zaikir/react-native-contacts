import Contacts

@objc(RNContacts)
class RNContacts: NSObject {
  var store: CNContactStore
  var keysToFetch: [String]

  override init() {
    store = CNContactStore()
    keysToFetch = [
      CNContactIdentifierKey,
      CNContactEmailAddressesKey,
      CNContactPhoneNumbersKey,
      CNContactFamilyNameKey,
      CNContactGivenNameKey,
      CNContactMiddleNameKey,
      CNContactOrganizationNameKey,
      CNContactUrlAddressesKey,
      CNContactBirthdayKey,
    ]

    super.init()
  }

  @objc(fetchContacts:withRejecter:)
  func fetchContacts(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    checkContactsAccess(
      onGranted: {
        let request = CNContactFetchRequest(keysToFetch: self.keysToFetch as [CNKeyDescriptor])

        var contacts = [[String: Any]]()

        do {
          try self.store.enumerateContacts(with: request) { contact, _ in
            var dict = [String: Any]()
            dict["id"] = contact.identifier
            dict["firstName"] = contact.givenName
            dict["secondName"] = contact.familyName
            dict["middleName"] = contact.middleName
            dict["organizationName"] = contact.organizationName

            if contact.birthday?.date == nil {
              dict["birthday"] = ""
            } else {
              let dateFormatter = DateFormatter()
              dateFormatter.dateFormat = "yyyy-MM-dd"
              dict["birthday"] = dateFormatter.string(from: contact.birthday!.date!)
            }

            dict["phoneNumbers"] = contact.phoneNumbers.map { phoneNumber in
              var itemDict = [String: Any]()
              let localizedLabel = CNLabeledValue<CNPhoneNumber>.localizedString(forLabel: phoneNumber.label ?? "")

              itemDict["id"] = phoneNumber.identifier
              itemDict["label"] = phoneNumber.label ?? ""
              itemDict["phoneNumber"] = phoneNumber.value.stringValue
              itemDict["localizedLabel"] = localizedLabel

              return itemDict
            }

            dict["emails"] = contact.emailAddresses.map { emailAddress in
              var itemDict = [String: Any]()
              let localizedLabel = CNLabeledValue<NSString>.localizedString(forLabel: emailAddress.label ?? "")

              itemDict["id"] = emailAddress.identifier
              itemDict["label"] = emailAddress.label ?? ""
              itemDict["email"] = emailAddress.value
              itemDict["localizedLabel"] = localizedLabel

              return itemDict
            }

            dict["urlAddresses"] = contact.urlAddresses.map { urlAddress in
              var itemDict = [String: Any]()
              let localizedLabel = CNLabeledValue<NSString>.localizedString(forLabel: urlAddress.label ?? "")

              itemDict["id"] = urlAddress.identifier
              itemDict["label"] = urlAddress.label ?? ""
              itemDict["url"] = urlAddress.value
              itemDict["localizedLabel"] = localizedLabel

              return itemDict
            }

            contacts.append(dict)
          }

          resolve(contacts)
        } catch {
          reject("Error", error.localizedDescription, nil)
        }
      },
      onDenied: {
        reject("Permission denied", "Photos access permission required", nil)
      }
    )
  }

  @objc(updateContacts:withResolver:withRejecter:)
  func updateContacts(contacts: [[String: Any]], resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    checkContactsAccess(
      onGranted: {
       let request = CNContactFetchRequest(keysToFetch: self.keysToFetch as [CNKeyDescriptor])
        let ids = contacts.filter { item in (item["id"] as! String) != "" }.map { item in item["id"] as! String }
        
        if (ids.count > 0) {
            request.predicate = CNContact.predicateForContacts(withIdentifiers: ids)
        }

        var mutableContacts = [CNMutableContact]()
        var deletedContacts = [CNMutableContact]()

        do {
            if (ids.count > 0) {
                try self.store.enumerateContacts(with: request) { originalContact, _ in
                  var updatedContact = contacts.first { item in
                    (item["id"] as! String) == originalContact.identifier
                  }

                  if updatedContact == nil {
                    return
                  }

                  if updatedContact!["action"] as? String == "delete" {
                    deletedContacts.append(originalContact.mutableCopy() as! CNMutableContact)
                  } else {
                    mutableContacts.append(self.updateRecord(originalContact: originalContact, updatedContact: updatedContact!))
                  }
                }
            }

          let saveRequest = CNSaveRequest()

          mutableContacts.forEach { contact in
            saveRequest.update(contact)
          }

          deletedContacts.forEach { contact in
            saveRequest.delete(contact)
          }

          contacts.filter { item in (item["id"] as! String) == "" }.forEach { contact in
            saveRequest.add(self.updateRecord(originalContact: nil, updatedContact: contact), toContainerWithIdentifier: nil)
          }

          try self.store.execute(saveRequest)

          resolve(true)
        } catch {
          reject("Error", error.localizedDescription, nil)
        }
      },
      onDenied: {
        reject("Permission denied", "Photos access permission required", nil)
      }
    )
  }

  func updateRecord(originalContact: CNContact?, updatedContact: [String: Any]) -> CNMutableContact {
    var mutableContact = originalContact == nil
      ? CNMutableContact()
      : originalContact!.mutableCopy() as! CNMutableContact

    mutableContact.givenName = updatedContact["firstName"] as! String
    mutableContact.familyName = updatedContact["secondName"] as! String
    mutableContact.middleName = updatedContact["middleName"] as! String
    mutableContact.organizationName = updatedContact["organizationName"] as! String

    if (updatedContact["birthday"] as! String) == "" {
      mutableContact.birthday = nil
    } else {
      let dateFormatter = DateFormatter()
      dateFormatter.dateFormat = "yyyy-MM-dd"
      mutableContact.birthday = Calendar.current.dateComponents([.year, .month, .day], from: dateFormatter.date(from: updatedContact["birthday"] as! String)!)
    }

    mutableContact.phoneNumbers = (updatedContact["phoneNumbers"] as! [[String: Any]]).map { item in
      var label: String = item["label"] as! String
      var phoneNumber = item["phoneNumber"] as! String

      var existingItem = item["id"] == nil ? nil : mutableContact.phoneNumbers.first { nestedItem in
        nestedItem.identifier == (item["id"] as! String)
      }

      if existingItem != nil, existingItem!.label == label, existingItem!.value.stringValue == phoneNumber {
        return existingItem!
      }

      return CNLabeledValue<CNPhoneNumber>.init(label: label, value: CNPhoneNumber(stringValue: phoneNumber))
    }

    mutableContact.emailAddresses = (updatedContact["emails"] as! [[String: Any]]).map { item in
      var label: String = item["label"] as! String
      var itemValue = item["email"] as! NSString

      var existingItem = item["id"] == nil ? nil : mutableContact.emailAddresses.first { nestedItem in
        nestedItem.identifier == (item["id"] as! String)
      }

      if existingItem != nil, existingItem!.label == label, existingItem!.value == itemValue {
        return existingItem!
      }

      return CNLabeledValue<NSString>.init(label: label, value: itemValue)
    }

    mutableContact.urlAddresses = (updatedContact["urlAddresses"] as! [[String: Any]]).map { item in
      var label: String = item["label"] as! String
      var itemValue = item["url"] as! NSString

      var existingItem = item["id"] == nil ? nil : mutableContact.urlAddresses.first { nestedItem in
        nestedItem.identifier == (item["id"] as! String)
      }

      if existingItem != nil, existingItem!.label == label, existingItem!.value == itemValue {
        return existingItem!
      }

      return CNLabeledValue<NSString>.init(label: label, value: itemValue)
    }

    return mutableContact
  }

  func checkContactsAccess(onGranted: @escaping () -> Void, onDenied: @escaping () -> Void) {
    store.requestAccess(for: .contacts) {
      granted, _ in
      if granted {
        onGranted()
      } else {
        onDenied()
      }
    }
  }
}
