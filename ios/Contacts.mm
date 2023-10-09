#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(RNContacts, NSObject)

RCT_EXTERN_METHOD(fetchContacts:(RCTPromiseResolveBlock)resolve withRejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(updateContacts:(NSDictionary *)contacts withResolver:(RCTPromiseResolveBlock)resolve withRejecter:(RCTPromiseRejectBlock)reject)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end
