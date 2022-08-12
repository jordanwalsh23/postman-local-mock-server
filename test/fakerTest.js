'use strict';
const assert = require('assert')
const getFakeValue = require('../lib/faker').getFakeValue;

describe('Faker Tests', () => {
  
  it('Fakes a $guid', () => {
    const fakeValue = getFakeValue('$guid');
    assert(fakeValue.match(/^[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}$/));
  })

  it('Fakes a $timestamp', () => {
    const fakeValue = getFakeValue('$timestamp');
    assert(typeof fakeValue === 'number');
    assert(Date.now() >= fakeValue)
  })

  it('Fakes an $isoTimestamp', () => {
    const fakeValue = getFakeValue('$isoTimestamp');
    assert(typeof fakeValue === 'string');
    assert(new Date().toISOString() === fakeValue)
  })

  it('Fakes a $randomUUID', () => {
    const fakeValue = getFakeValue('$randomUUID');
    assert(fakeValue.match(/^[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}$/));
  })

  it('Fakes a $randomAlphaNumeric', () => {
    const fakeValue = getFakeValue('$randomAlphaNumeric');
    assert(fakeValue.length == 1);
  });
  
  
  it('Fakes a $randomBoolean', () => {
    const fakeValue = getFakeValue('$randomBoolean');
    assert(typeof fakeValue === 'boolean');
    assert(fakeValue === true || fakeValue === false);
  });
  
  
  it('Fakes a $randomInt', () => {
    const fakeValue = getFakeValue('$randomInt');
    assert(typeof fakeValue === 'number');
    assert(fakeValue < 1000);
  });
  
  
  it('Fakes a $randomColor', () => {
    const fakeValue = getFakeValue('$randomColor');
    assert(typeof fakeValue == 'string')
    assert(fakeValue.length > 1);
  });
  
  
  it('Fakes a $randomHexColor', () => {
    const fakeValue = getFakeValue('$randomHexColor');
    assert(typeof fakeValue == 'string');
    assert(fakeValue.charAt(0) == '#');
    assert(fakeValue.length > 1);
  });
  
  
  it('Fakes a $randomAbbreviation', () => {
    const fakeValue = getFakeValue('$randomAbbreviation');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomIP', () => {
    const fakeValue = getFakeValue('$randomIP');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomIPV6', () => {
    const fakeValue = getFakeValue('$randomIPV6');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomMACAddress', () => {
    const fakeValue = getFakeValue('$randomMACAddress');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomPassword', () => {
    const fakeValue = getFakeValue('$randomPassword');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomLocale', () => {
    const fakeValue = getFakeValue('$randomLocale');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomUserAgent', () => {
    const fakeValue = getFakeValue('$randomUserAgent');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomProtocol', () => {
    const fakeValue = getFakeValue('$randomProtocol');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomSemver', () => {
    const fakeValue = getFakeValue('$randomSemver');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomFirstName', () => {
    const fakeValue = getFakeValue('$randomFirstName');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomLastName', () => {
    const fakeValue = getFakeValue('$randomLastName');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomFullName', () => {
    const fakeValue = getFakeValue('$randomFullName');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomNamePrefix', () => {
    const fakeValue = getFakeValue('$randomNamePrefix');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomNameSuffix', () => {
    const fakeValue = getFakeValue('$randomNameSuffix');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomJobArea', () => {
    const fakeValue = getFakeValue('$randomJobArea');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomJobDescriptor', () => {
    const fakeValue = getFakeValue('$randomJobDescriptor');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomJobTitle', () => {
    const fakeValue = getFakeValue('$randomJobTitle');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomJobType', () => {
    const fakeValue = getFakeValue('$randomJobType');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomPhoneNumber', () => {
    const fakeValue = getFakeValue('$randomPhoneNumber');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomPhoneNumberExt', () => {
    const fakeValue = getFakeValue('$randomPhoneNumberExt');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomCity', () => {
    const fakeValue = getFakeValue('$randomCity');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomStreetName', () => {
    const fakeValue = getFakeValue('$randomStreetName');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomStreetAddress', () => {
    const fakeValue = getFakeValue('$randomStreetAddress');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomCountry', () => {
    const fakeValue = getFakeValue('$randomCountry');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomCountryCode', () => {
    const fakeValue = getFakeValue('$randomCountryCode');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomLatitude', () => {
    const fakeValue = getFakeValue('$randomLatitude');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomLongitude', () => {
    const fakeValue = getFakeValue('$randomLongitude');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomAvatarImage', () => {
    const fakeValue = getFakeValue('$randomAvatarImage');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomImageUrl', () => {
    const fakeValue = getFakeValue('$randomImageUrl');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomAbstractImage', () => {
    const fakeValue = getFakeValue('$randomAbstractImage');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomAnimalsImage', () => {
    const fakeValue = getFakeValue('$randomAnimalsImage');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomBusinessImage', () => {
    const fakeValue = getFakeValue('$randomBusinessImage');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomCatsImage', () => {
    const fakeValue = getFakeValue('$randomCatsImage');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomCityImage', () => {
    const fakeValue = getFakeValue('$randomCityImage');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomFoodImage', () => {
    const fakeValue = getFakeValue('$randomFoodImage');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomNightlifeImage', () => {
    const fakeValue = getFakeValue('$randomNightlifeImage');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomFashionImage', () => {
    const fakeValue = getFakeValue('$randomFashionImage');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomPeopleImage', () => {
    const fakeValue = getFakeValue('$randomPeopleImage');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomNatureImage', () => {
    const fakeValue = getFakeValue('$randomNatureImage');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomSportsImage', () => {
    const fakeValue = getFakeValue('$randomSportsImage');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomTransportImage', () => {
    const fakeValue = getFakeValue('$randomTransportImage');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomImageDataUri', () => {
    const fakeValue = getFakeValue('$randomImageDataUri');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomBankAccount', () => {
    const fakeValue = getFakeValue('$randomBankAccount');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomBankAccountName', () => {
    const fakeValue = getFakeValue('$randomBankAccountName');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomCreditCardMask', () => {
    const fakeValue = getFakeValue('$randomCreditCardMask');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomBankAccountBic', () => {
    const fakeValue = getFakeValue('$randomBankAccountBic');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomBankAccountIban', () => {
    const fakeValue = getFakeValue('$randomBankAccountIban');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomTransactionType', () => {
    const fakeValue = getFakeValue('$randomTransactionType');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomCurrencyCode', () => {
    const fakeValue = getFakeValue('$randomCurrencyCode');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomCurrencyName', () => {
    const fakeValue = getFakeValue('$randomCurrencyName');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomCurrencySymbol', () => {
    const fakeValue = getFakeValue('$randomCurrencySymbol');
    assert(fakeValue);
  });
  
  
  
  it('Fakes a $randomBitcoin', () => {
    const fakeValue = getFakeValue('$randomBitcoin');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomCompanyName', () => {
    const fakeValue = getFakeValue('$randomCompanyName');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomCompanySuffix', () => {
    const fakeValue = getFakeValue('$randomCompanySuffix');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomBs', () => {
    const fakeValue = getFakeValue('$randomBs');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomBsAdjective', () => {
    const fakeValue = getFakeValue('$randomBsAdjective');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomBsBuzz', () => {
    const fakeValue = getFakeValue('$randomBsBuzz');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomBsNoun', () => {
    const fakeValue = getFakeValue('$randomBsNoun');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomCatchPhrase', () => {
    const fakeValue = getFakeValue('$randomCatchPhrase');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomCatchPhraseAdjective', () => {
    const fakeValue = getFakeValue('$randomCatchPhraseAdjective');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomCatchPhraseDescriptor', () => {
    const fakeValue = getFakeValue('$randomCatchPhraseDescriptor');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomCatchPhraseNoun', () => {
    const fakeValue = getFakeValue('$randomCatchPhraseNoun');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomDatabaseColumn', () => {
    const fakeValue = getFakeValue('$randomDatabaseColumn');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomDatabaseType', () => {
    const fakeValue = getFakeValue('$randomDatabaseType');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomDatabaseCollation', () => {
    const fakeValue = getFakeValue('$randomDatabaseCollation');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomDatabaseEngine', () => {
    const fakeValue = getFakeValue('$randomDatabaseEngine');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomDateFuture', () => {
    const fakeValue = getFakeValue('$randomDateFuture');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomDatePast', () => {
    const fakeValue = getFakeValue('$randomDatePast');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomDateRecent', () => {
    const fakeValue = getFakeValue('$randomDateRecent');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomWeekday', () => {
    const fakeValue = getFakeValue('$randomWeekday');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomMonth', () => {
    const fakeValue = getFakeValue('$randomMonth');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomDomainName', () => {
    const fakeValue = getFakeValue('$randomDomainName');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomDomainSuffix', () => {
    const fakeValue = getFakeValue('$randomDomainSuffix');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomDomainWord', () => {
    const fakeValue = getFakeValue('$randomDomainWord');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomEmail', () => {
    const fakeValue = getFakeValue('$randomEmail');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomExampleEmail', () => {
    const fakeValue = getFakeValue('$randomExampleEmail');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomUserName', () => {
    const fakeValue = getFakeValue('$randomUserName');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomUrl', () => {
    const fakeValue = getFakeValue('$randomUrl');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomFileName', () => {
    const fakeValue = getFakeValue('$randomFileName');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomFileType', () => {
    const fakeValue = getFakeValue('$randomFileType');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomFileExt', () => {
    const fakeValue = getFakeValue('$randomFileExt');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomCommonFileName', () => {
    const fakeValue = getFakeValue('$randomCommonFileName');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomCommonFileType', () => {
    const fakeValue = getFakeValue('$randomCommonFileType');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomCommonFileExt', () => {
    const fakeValue = getFakeValue('$randomCommonFileExt');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomFilePath', () => {
    const fakeValue = getFakeValue('$randomFilePath');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomDirectoryPath', () => {
    const fakeValue = getFakeValue('$randomDirectoryPath');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomMimeType', () => {
    const fakeValue = getFakeValue('$randomMimeType');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomPrice', () => {
    const fakeValue = getFakeValue('$randomPrice');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomProduct', () => {
    const fakeValue = getFakeValue('$randomProduct');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomProductAdjective', () => {
    const fakeValue = getFakeValue('$randomProductAdjective');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomProductMaterial', () => {
    const fakeValue = getFakeValue('$randomProductMaterial');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomProductName', () => {
    const fakeValue = getFakeValue('$randomProductName');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomDepartment', () => {
    const fakeValue = getFakeValue('$randomDepartment');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomNoun', () => {
    const fakeValue = getFakeValue('$randomNoun');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomVerb', () => {
    const fakeValue = getFakeValue('$randomVerb');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomIngverb', () => {
    const fakeValue = getFakeValue('$randomIngverb');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomAdjective', () => {
    const fakeValue = getFakeValue('$randomAdjective');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomWord', () => {
    const fakeValue = getFakeValue('$randomWord');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomWords', () => {
    const fakeValue = getFakeValue('$randomWords');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomPhrase', () => {
    const fakeValue = getFakeValue('$randomPhrase');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomLoremWord', () => {
    const fakeValue = getFakeValue('$randomLoremWord');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomLoremWords', () => {
    const fakeValue = getFakeValue('$randomLoremWords');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomLoremSentence', () => {
    const fakeValue = getFakeValue('$randomLoremSentence');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomLoremSentences', () => {
    const fakeValue = getFakeValue('$randomLoremSentences');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomLoremParagraph', () => {
    const fakeValue = getFakeValue('$randomLoremParagraph');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomLoremParagraphs', () => {
    const fakeValue = getFakeValue('$randomLoremParagraphs');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomLoremText', () => {
    const fakeValue = getFakeValue('$randomLoremText');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomLoremSlug', () => {
    const fakeValue = getFakeValue('$randomLoremSlug');
    assert(fakeValue);
  });
  
  
  it('Fakes a $randomLoremLines', () => {
    const fakeValue = getFakeValue('$randomLoremLines');
    assert(fakeValue);
  });
    
});