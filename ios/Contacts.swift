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
              itemDict["phoneNumber"] = phoneNumber.value.stringValue
              itemDict["label"] = localizedLabel

              return itemDict
            }

            dict["emails"] = contact.emailAddresses.map { emailAddress in
              var itemDict = [String: Any]()
              let localizedLabel = CNLabeledValue<NSString>.localizedString(forLabel: emailAddress.label ?? "")

              itemDict["id"] = emailAddress.identifier
              itemDict["email"] = emailAddress.value
              itemDict["label"] = localizedLabel

              return itemDict
            }

            dict["urlAddresses"] = contact.urlAddresses.map { urlAddress in
              var itemDict = [String: Any]()
              let localizedLabel = CNLabeledValue<NSString>.localizedString(forLabel: urlAddress.label ?? "")

              itemDict["id"] = urlAddress.identifier
              itemDict["url"] = urlAddress.value
              itemDict["label"] = localizedLabel

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
        request.predicate = CNContact.predicateForContacts(withIdentifiers: contacts.map { item in
          item["id"] as! String
        })

        var mutableContacts = [CNMutableContact]()

        do {
          try self.store.enumerateContacts(with: request) { originalContact, _ in
            var updatedContact = contacts.first { item in
              (item["id"] as! String) == originalContact.identifier
            }

            if updatedContact == nil {
              return
            }

            var mutableContact = originalContact.mutableCopy() as! CNMutableContact
            mutableContact.givenName = updatedContact!["firstName"] as! String
            mutableContact.familyName = updatedContact!["secondName"] as! String
            mutableContact.middleName = updatedContact!["middleName"] as! String
            mutableContact.organizationName = updatedContact!["organizationName"] as! String

            if (updatedContact!["birthday"] as! String) == "" {
              mutableContact.birthday = nil
            } else {
              let dateFormatter = DateFormatter()
              dateFormatter.dateFormat = "yyyy-MM-dd"
              mutableContact.birthday = Calendar.current.dateComponents([.year, .month, .day, .hour, .minute, .second], from: dateFormatter.date(from: updatedContact!["birthday"] as! String)!)
            }

            mutableContact.phoneNumbers = (updatedContact!["phoneNumbers"] as! [[String: Any]]).map { item in
              var label: String = item["label"] as! String

              if label == "main" {
                label = CNLabelPhoneNumberMain
              } else if label == "mobile" {
                label = CNLabelPhoneNumberMobile
              } else if label == "iPhone" {
                label = CNLabelPhoneNumberiPhone
              }

              return CNLabeledValue<CNPhoneNumber>.init(label: label, value: CNPhoneNumber(stringValue: item["phoneNumber"] as! String))
            }

            mutableContact.emailAddresses = (updatedContact!["emails"] as! [[String: Any]]).map { item in
                CNLabeledValue<NSString>.init(label: (item["label"] as! String), value: item["email"] as! NSString)
            }

            mutableContact.emailAddresses = (updatedContact!["urlAddresses"] as! [[String: Any]]).map { item in
                CNLabeledValue<NSString>.init(label: (item["label"] as! String), value: item["url"] as! NSString)
            }

            mutableContacts.append(mutableContact)
          }

          let saveRequest = CNSaveRequest()
          mutableContacts.forEach { contact in
            saveRequest.update(contact)
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
