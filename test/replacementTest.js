'use strict';
const assert = require('assert')
const getReplacementValue = require('../lib/replacements').getReplacementValue;

describe('Replacement Tests', () => {

  it('Replaces a $queryParams', () => {
    let req = {
      query: {
        name: 'John'
      }
    }
    const replacementValue = getReplacementValue("$queryParams 'name'", req);
    assert(replacementValue == req.query.name);
  })

  it('Replaces a $queryParams with a default value', () => {
    let defaultValue = 36;
    let req = {
      query: {
        name: 'John'
      }
    }
    const replacementValue = getReplacementValue("$queryParams 'age' '36'", req);
    assert(replacementValue == defaultValue);
  })

  it('Replaces a $headers', () => {
    let req = {
      headers: {
        name: 'John'
      }
    }
    const replacementValue = getReplacementValue("$headers 'name'", req);
    assert(replacementValue == req.headers.name);
  })

  it('Replaces a $headers with a default value', () => {
    let defaultValue = 36;
    let req = {
      headers: {
        name: 'John'
      }
    }
    const replacementValue = getReplacementValue("$headers 'age' '36'", req);
    assert(replacementValue == defaultValue);
  })

  it('Replaces a $pathSegments', () => {
    let req = {
      path: '/get/12345'
    }
    let replacementValue = getReplacementValue("$pathSegments '0'", req);
    assert(replacementValue == "get");

    replacementValue = getReplacementValue("$pathSegments '1'", req);
    assert(replacementValue == "12345");
  })

  it('Replaces a $body param', () => {
    let req = {
      body: {
        name: "John"
      }
    }
    const replacementValue = getReplacementValue("$body 'name'", req);
    assert(replacementValue == req.body.name);
  })

  it('Replaces a $body param with a default', () => {
    let req = {
      body: {
        name: "John"
      }
    }
    const replacementValue = getReplacementValue("$body 'age' '36", req);
    assert(replacementValue == 36);
  })

  it('Replaces the whole $body ', () => {
    let req = {
      body: {
        name: "John"
      }
    }
    const replacementValue = getReplacementValue("$body", req);
    assert(replacementValue == JSON.stringify(req.body));
  })

  it('Replaces a $guid', () => {
    const replacementValue = getReplacementValue('$guid');
    assert(replacementValue.match(/^[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}$/));
  })

  it('Replaces a $timestamp', () => {
    const replacementValue = getReplacementValue('$timestamp');
    assert(typeof replacementValue === 'number');
    assert(Date.now() >= replacementValue)
  })

  it('Replaces an $isoTimestamp', () => {
    const replacementValue = getReplacementValue('$isoTimestamp');
    assert(typeof replacementValue === 'string');
    assert(replacementValue.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/))
  })

  it('Replaces a $randomUUID', () => {
    const replacementValue = getReplacementValue('$randomUUID');
    assert(replacementValue.match(/^[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}$/));
  })

  it('Replaces a $randomAlphaNumeric', () => {
    const replacementValue = getReplacementValue('$randomAlphaNumeric');
    assert(replacementValue.length == 1);
    assert(replacementValue.match(/[a-zA-Z0-9]/))
  });


  it('Replaces a $randomBoolean', () => {
    const replacementValue = getReplacementValue('$randomBoolean');
    assert(typeof replacementValue === 'boolean');
    assert(replacementValue === true || replacementValue === false);
  });


  it('Replaces a $randomInt', () => {
    const replacementValue = getReplacementValue('$randomInt');
    assert(typeof replacementValue === 'number');
    assert(replacementValue < 1000);
  });


  it('Replaces a $randomColor', () => {
    const replacementValue = getReplacementValue('$randomColor');
    assert(typeof replacementValue == 'string')
    assert(replacementValue.length > 1);
  });


  it('Replaces a $randomHexColor', () => {
    const replacementValue = getReplacementValue('$randomHexColor');
    assert(typeof replacementValue == 'string');
    assert(replacementValue.charAt(0) == '#');
    assert(replacementValue.length > 1);
  });


  it('Replaces a $randomAbbreviation', () => {
    const replacementValue = getReplacementValue('$randomAbbreviation');
    assert(replacementValue);
  });


  it('Replaces a $randomIP', () => {
    const replacementValue = getReplacementValue('$randomIP');
    assert(replacementValue);
  });


  it('Replaces a $randomIPV6', () => {
    const replacementValue = getReplacementValue('$randomIPV6');
    assert(replacementValue);
  });


  it('Replaces a $randomMACAddress', () => {
    const replacementValue = getReplacementValue('$randomMACAddress');
    assert(replacementValue);
  });


  it('Replaces a $randomPassword', () => {
    const replacementValue = getReplacementValue('$randomPassword');
    assert(replacementValue);
  });


  it('Replaces a $randomLocale', () => {
    const replacementValue = getReplacementValue('$randomLocale');
    assert(replacementValue);
  });


  it('Replaces a $randomUserAgent', () => {
    const replacementValue = getReplacementValue('$randomUserAgent');
    assert(replacementValue);
  });


  it('Replaces a $randomProtocol', () => {
    const replacementValue = getReplacementValue('$randomProtocol');
    assert(replacementValue);
  });


  it('Replaces a $randomSemver', () => {
    const replacementValue = getReplacementValue('$randomSemver');
    assert(replacementValue);
  });


  it('Replaces a $randomFirstName', () => {
    const replacementValue = getReplacementValue('$randomFirstName');
    assert(replacementValue);
  });


  it('Replaces a $randomLastName', () => {
    const replacementValue = getReplacementValue('$randomLastName');
    assert(replacementValue);
  });


  it('Replaces a $randomFullName', () => {
    const replacementValue = getReplacementValue('$randomFullName');
    assert(replacementValue);
  });


  it('Replaces a $randomNamePrefix', () => {
    const replacementValue = getReplacementValue('$randomNamePrefix');
    assert(replacementValue);
  });


  it('Replaces a $randomNameSuffix', () => {
    const replacementValue = getReplacementValue('$randomNameSuffix');
    assert(replacementValue);
  });


  it('Replaces a $randomJobArea', () => {
    const replacementValue = getReplacementValue('$randomJobArea');
    assert(replacementValue);
  });


  it('Replaces a $randomJobDescriptor', () => {
    const replacementValue = getReplacementValue('$randomJobDescriptor');
    assert(replacementValue);
  });


  it('Replaces a $randomJobTitle', () => {
    const replacementValue = getReplacementValue('$randomJobTitle');
    assert(replacementValue);
  });


  it('Replaces a $randomJobType', () => {
    const replacementValue = getReplacementValue('$randomJobType');
    assert(replacementValue);
  });


  it('Replaces a $randomPhoneNumber', () => {
    const replacementValue = getReplacementValue('$randomPhoneNumber');
    assert(replacementValue);
  });


  it('Replaces a $randomPhoneNumberExt', () => {
    const replacementValue = getReplacementValue('$randomPhoneNumberExt');
    assert(replacementValue);
  });


  it('Replaces a $randomCity', () => {
    const replacementValue = getReplacementValue('$randomCity');
    assert(replacementValue);
  });


  it('Replaces a $randomStreetName', () => {
    const replacementValue = getReplacementValue('$randomStreetName');
    assert(replacementValue);
  });


  it('Replaces a $randomStreetAddress', () => {
    const replacementValue = getReplacementValue('$randomStreetAddress');
    assert(replacementValue);
  });


  it('Replaces a $randomCountry', () => {
    const replacementValue = getReplacementValue('$randomCountry');
    assert(replacementValue);
  });


  it('Replaces a $randomCountryCode', () => {
    const replacementValue = getReplacementValue('$randomCountryCode');
    assert(replacementValue);
  });


  it('Replaces a $randomLatitude', () => {
    const replacementValue = getReplacementValue('$randomLatitude');
    assert(replacementValue);
  });


  it('Replaces a $randomLongitude', () => {
    const replacementValue = getReplacementValue('$randomLongitude');
    assert(replacementValue);
  });


  it('Replaces a $randomAvatarImage', () => {
    const replacementValue = getReplacementValue('$randomAvatarImage');
    assert(replacementValue);
  });


  it('Replaces a $randomImageUrl', () => {
    const replacementValue = getReplacementValue('$randomImageUrl');
    assert(replacementValue);
  });


  it('Replaces a $randomAbstractImage', () => {
    const replacementValue = getReplacementValue('$randomAbstractImage');
    assert(replacementValue);
  });


  it('Replaces a $randomAnimalsImage', () => {
    const replacementValue = getReplacementValue('$randomAnimalsImage');
    assert(replacementValue);
  });


  it('Replaces a $randomBusinessImage', () => {
    const replacementValue = getReplacementValue('$randomBusinessImage');
    assert(replacementValue);
  });


  it('Replaces a $randomCatsImage', () => {
    const replacementValue = getReplacementValue('$randomCatsImage');
    assert(replacementValue);
  });


  it('Replaces a $randomCityImage', () => {
    const replacementValue = getReplacementValue('$randomCityImage');
    assert(replacementValue);
  });


  it('Replaces a $randomFoodImage', () => {
    const replacementValue = getReplacementValue('$randomFoodImage');
    assert(replacementValue);
  });


  it('Replaces a $randomNightlifeImage', () => {
    const replacementValue = getReplacementValue('$randomNightlifeImage');
    assert(replacementValue);
  });


  it('Replaces a $randomFashionImage', () => {
    const replacementValue = getReplacementValue('$randomFashionImage');
    assert(replacementValue);
  });


  it('Replaces a $randomPeopleImage', () => {
    const replacementValue = getReplacementValue('$randomPeopleImage');
    assert(replacementValue);
  });


  it('Replaces a $randomNatureImage', () => {
    const replacementValue = getReplacementValue('$randomNatureImage');
    assert(replacementValue);
  });


  it('Replaces a $randomSportsImage', () => {
    const replacementValue = getReplacementValue('$randomSportsImage');
    assert(replacementValue);
  });


  it('Replaces a $randomTransportImage', () => {
    const replacementValue = getReplacementValue('$randomTransportImage');
    assert(replacementValue);
  });


  it('Replaces a $randomImageDataUri', () => {
    const replacementValue = getReplacementValue('$randomImageDataUri');
    assert(replacementValue);
  });


  it('Replaces a $randomBankAccount', () => {
    const replacementValue = getReplacementValue('$randomBankAccount');
    assert(replacementValue);
  });


  it('Replaces a $randomBankAccountName', () => {
    const replacementValue = getReplacementValue('$randomBankAccountName');
    assert(replacementValue);
  });


  it('Replaces a $randomCreditCardMask', () => {
    const replacementValue = getReplacementValue('$randomCreditCardMask');
    assert(replacementValue);
  });


  it('Replaces a $randomBankAccountBic', () => {
    const replacementValue = getReplacementValue('$randomBankAccountBic');
    assert(replacementValue);
  });


  it('Replaces a $randomBankAccountIban', () => {
    const replacementValue = getReplacementValue('$randomBankAccountIban');
    assert(replacementValue);
  });


  it('Replaces a $randomTransactionType', () => {
    const replacementValue = getReplacementValue('$randomTransactionType');
    assert(replacementValue);
  });


  it('Replaces a $randomCurrencyCode', () => {
    const replacementValue = getReplacementValue('$randomCurrencyCode');
    assert(replacementValue);
  });


  it('Replaces a $randomCurrencyName', () => {
    const replacementValue = getReplacementValue('$randomCurrencyName');
    assert(replacementValue);
  });


  it('Replaces a $randomCurrencySymbol', () => {
    const replacementValue = getReplacementValue('$randomCurrencySymbol');
    assert(replacementValue);
  });



  it('Replaces a $randomBitcoin', () => {
    const replacementValue = getReplacementValue('$randomBitcoin');
    assert(replacementValue);
  });


  it('Replaces a $randomCompanyName', () => {
    const replacementValue = getReplacementValue('$randomCompanyName');
    assert(replacementValue);
  });


  it('Replaces a $randomCompanySuffix', () => {
    const replacementValue = getReplacementValue('$randomCompanySuffix');
    assert(replacementValue);
  });


  it('Replaces a $randomBs', () => {
    const replacementValue = getReplacementValue('$randomBs');
    assert(replacementValue);
  });


  it('Replaces a $randomBsAdjective', () => {
    const replacementValue = getReplacementValue('$randomBsAdjective');
    assert(replacementValue);
  });


  it('Replaces a $randomBsBuzz', () => {
    const replacementValue = getReplacementValue('$randomBsBuzz');
    assert(replacementValue);
  });


  it('Replaces a $randomBsNoun', () => {
    const replacementValue = getReplacementValue('$randomBsNoun');
    assert(replacementValue);
  });


  it('Replaces a $randomCatchPhrase', () => {
    const replacementValue = getReplacementValue('$randomCatchPhrase');
    assert(replacementValue);
  });


  it('Replaces a $randomCatchPhraseAdjective', () => {
    const replacementValue = getReplacementValue('$randomCatchPhraseAdjective');
    assert(replacementValue);
  });


  it('Replaces a $randomCatchPhraseDescriptor', () => {
    const replacementValue = getReplacementValue('$randomCatchPhraseDescriptor');
    assert(replacementValue);
  });


  it('Replaces a $randomCatchPhraseNoun', () => {
    const replacementValue = getReplacementValue('$randomCatchPhraseNoun');
    assert(replacementValue);
  });


  it('Replaces a $randomDatabaseColumn', () => {
    const replacementValue = getReplacementValue('$randomDatabaseColumn');
    assert(replacementValue);
  });


  it('Replaces a $randomDatabaseType', () => {
    const replacementValue = getReplacementValue('$randomDatabaseType');
    assert(replacementValue);
  });


  it('Replaces a $randomDatabaseCollation', () => {
    const replacementValue = getReplacementValue('$randomDatabaseCollation');
    assert(replacementValue);
  });


  it('Replaces a $randomDatabaseEngine', () => {
    const replacementValue = getReplacementValue('$randomDatabaseEngine');
    assert(replacementValue);
  });


  it('Replaces a $randomDateFuture', () => {
    const replacementValue = getReplacementValue('$randomDateFuture');
    assert(replacementValue);
  });


  it('Replaces a $randomDatePast', () => {
    const replacementValue = getReplacementValue('$randomDatePast');
    assert(replacementValue);
  });


  it('Replaces a $randomDateRecent', () => {
    const replacementValue = getReplacementValue('$randomDateRecent');
    assert(replacementValue);
  });


  it('Replaces a $randomWeekday', () => {
    const replacementValue = getReplacementValue('$randomWeekday');
    assert(replacementValue);
  });


  it('Replaces a $randomMonth', () => {
    const replacementValue = getReplacementValue('$randomMonth');
    assert(replacementValue);
  });


  it('Replaces a $randomDomainName', () => {
    const replacementValue = getReplacementValue('$randomDomainName');
    assert(replacementValue);
  });


  it('Replaces a $randomDomainSuffix', () => {
    const replacementValue = getReplacementValue('$randomDomainSuffix');
    assert(replacementValue);
  });


  it('Replaces a $randomDomainWord', () => {
    const replacementValue = getReplacementValue('$randomDomainWord');
    assert(replacementValue);
  });


  it('Replaces a $randomEmail', () => {
    const replacementValue = getReplacementValue('$randomEmail');
    assert(replacementValue);
  });


  it('Replaces a $randomExampleEmail', () => {
    const replacementValue = getReplacementValue('$randomExampleEmail');
    assert(replacementValue);
  });


  it('Replaces a $randomUserName', () => {
    const replacementValue = getReplacementValue('$randomUserName');
    assert(replacementValue);
  });


  it('Replaces a $randomUrl', () => {
    const replacementValue = getReplacementValue('$randomUrl');
    assert(replacementValue);
  });


  it('Replaces a $randomFileName', () => {
    const replacementValue = getReplacementValue('$randomFileName');
    assert(replacementValue);
  });


  it('Replaces a $randomFileType', () => {
    const replacementValue = getReplacementValue('$randomFileType');
    assert(replacementValue);
  });


  it('Replaces a $randomFileExt', () => {
    const replacementValue = getReplacementValue('$randomFileExt');
    assert(replacementValue);
  });


  it('Replaces a $randomCommonFileName', () => {
    const replacementValue = getReplacementValue('$randomCommonFileName');
    assert(replacementValue);
  });


  it('Replaces a $randomCommonFileType', () => {
    const replacementValue = getReplacementValue('$randomCommonFileType');
    assert(replacementValue);
  });


  it('Replaces a $randomCommonFileExt', () => {
    const replacementValue = getReplacementValue('$randomCommonFileExt');
    assert(replacementValue);
  });


  it('Replaces a $randomFilePath', () => {
    const replacementValue = getReplacementValue('$randomFilePath');
    assert(replacementValue);
  });


  it('Replaces a $randomDirectoryPath', () => {
    const replacementValue = getReplacementValue('$randomDirectoryPath');
    assert(replacementValue);
  });


  it('Replaces a $randomMimeType', () => {
    const replacementValue = getReplacementValue('$randomMimeType');
    assert(replacementValue);
  });


  it('Replaces a $randomPrice', () => {
    const replacementValue = getReplacementValue('$randomPrice');
    assert(replacementValue);
  });


  it('Replaces a $randomProduct', () => {
    const replacementValue = getReplacementValue('$randomProduct');
    assert(replacementValue);
  });


  it('Replaces a $randomProductAdjective', () => {
    const replacementValue = getReplacementValue('$randomProductAdjective');
    assert(replacementValue);
  });


  it('Replaces a $randomProductMaterial', () => {
    const replacementValue = getReplacementValue('$randomProductMaterial');
    assert(replacementValue);
  });


  it('Replaces a $randomProductName', () => {
    const replacementValue = getReplacementValue('$randomProductName');
    assert(replacementValue);
  });


  it('Replaces a $randomDepartment', () => {
    const replacementValue = getReplacementValue('$randomDepartment');
    assert(replacementValue);
  });


  it('Replaces a $randomNoun', () => {
    const replacementValue = getReplacementValue('$randomNoun');
    assert(replacementValue);
  });


  it('Replaces a $randomVerb', () => {
    const replacementValue = getReplacementValue('$randomVerb');
    assert(replacementValue);
  });


  it('Replaces a $randomIngverb', () => {
    const replacementValue = getReplacementValue('$randomIngverb');
    assert(replacementValue);
  });


  it('Replaces a $randomAdjective', () => {
    const replacementValue = getReplacementValue('$randomAdjective');
    assert(replacementValue);
  });


  it('Replaces a $randomWord', () => {
    const replacementValue = getReplacementValue('$randomWord');
    assert(replacementValue);
  });


  it('Replaces a $randomWords', () => {
    const replacementValue = getReplacementValue('$randomWords');
    assert(replacementValue);
  });


  it('Replaces a $randomPhrase', () => {
    const replacementValue = getReplacementValue('$randomPhrase');
    assert(replacementValue);
  });


  it('Replaces a $randomLoremWord', () => {
    const replacementValue = getReplacementValue('$randomLoremWord');
    assert(replacementValue);
  });


  it('Replaces a $randomLoremWords', () => {
    const replacementValue = getReplacementValue('$randomLoremWords');
    assert(replacementValue);
  });


  it('Replaces a $randomLoremSentence', () => {
    const replacementValue = getReplacementValue('$randomLoremSentence');
    assert(replacementValue);
  });


  it('Replaces a $randomLoremSentences', () => {
    const replacementValue = getReplacementValue('$randomLoremSentences');
    assert(replacementValue);
  });


  it('Replaces a $randomLoremParagraph', () => {
    const replacementValue = getReplacementValue('$randomLoremParagraph');
    assert(replacementValue);
  });


  it('Replaces a $randomLoremParagraphs', () => {
    const replacementValue = getReplacementValue('$randomLoremParagraphs');
    assert(replacementValue);
  });


  it('Replaces a $randomLoremText', () => {
    const replacementValue = getReplacementValue('$randomLoremText');
    assert(replacementValue);
  });


  it('Replaces a $randomLoremSlug', () => {
    const replacementValue = getReplacementValue('$randomLoremSlug');
    assert(replacementValue);
  });


  it('Replaces a $randomLoremLines', () => {
    const replacementValue = getReplacementValue('$randomLoremLines');
    assert(replacementValue);
  });

});