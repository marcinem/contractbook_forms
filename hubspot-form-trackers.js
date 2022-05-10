window.addEventListener("message", (event) => {
  if (
    event.data.type === "hsFormCallback" &&
    event.data.eventName === "onFormReady"
  ) {
    function getParam(p) {
      var match = RegExp("[?&]" + p + "=([^&]*)").exec(window.location.search);
      return match && decodeURIComponent(match[1].replace(/\+/g, " "));
    }

    function getExpiryRecord(value) {
      var expiryPeriod = 90 * 24 * 60 * 60 * 1000; // 90 day expiry in milliseconds

      var expiryDate = new Date().getTime() + expiryPeriod;
      return {
        value: value,
        expiryDate: expiryDate,
      };
    }

    function addGclid() {
      var gclidParam = getParam("gclid");
      var gclidFormFields = ['#hs_google_click_id, [name*="gclid"]']; // all possible gclid form field ids here
      var gclidRecord = null;
      var currGclidFormField;

      var gclsrcParam = getParam("gclsrc");
      var isGclsrcValid = !gclsrcParam || gclsrcParam.indexOf("aw") !== -1;

      gclidFormFields.forEach(function (field) {
        if (document.querySelectorAll(field)) {
          currGclidFormField = document.querySelectorAll(field);
        }
      });

      if (gclidParam && isGclsrcValid) {
        gclidRecord = getExpiryRecord(gclidParam);
        localStorage.setItem("gclid", JSON.stringify(gclidRecord));
        Cookies.set("gclid", JSON.stringify(gclidRecord), {
          domain: ".contractbook.com",
        });
      }

      var gclid = gclidRecord || JSON.parse(localStorage.getItem("gclid"));
      var isGclidValid = gclid && new Date().getTime() < gclid.expiryDate;

      if (currGclidFormField && isGclidValid) {
        currGclidFormField.forEach(function (field) {
          field.value = gclid.value;
        });
      }
    }

    function addFBid() {
      var fbc = Cookies.get("_fbc");
      var fbp = Cookies.get("_fbp");
      (function loop() {
        if (!fbp) {
          setTimeout(function () {
            fbp = Cookies.get("_fbp");
            fbc = Cookies.get("_fbc");
            loop();
          }, 3000);
        } else {
          var fbcFormFields = ['#fb_c_id, [name*="fbclid"]'];
          var fbpFormFields = ['#fb_p_id, [name*="fb_browser_id"]'];
          var currFbpFormField, currFbcFormField;

          fbpFormFields.forEach(function (field) {
            if (document.querySelectorAll(field) && fbp) {
              currFbpFormField = document.querySelectorAll(field);
              currFbpFormField.forEach(function (field) {
                field.value = fbp;
              });
            }
          });
          fbcFormFields.forEach(function (field) {
            if (document.querySelectorAll(field) && fbc) {
              currFbcFormField = document.querySelectorAll(field);
              currFbcFormField.forEach(function (field) {
                field.value = fbc;
              });
            }
          });
        }
      })();
    }

    function addHSid() {
      var hsID = Cookies.get("hubspotutk");
      var hsFormFields = ["#hs_id"]; // all possible gclid form field ids here
      var currHsFormField;

      hsFormFields.forEach(function (field) {
        if (document.querySelectorAll(field) && hsID) {
          currHsFormField = document.querySelectorAll(field);
          currHsFormField.forEach(function (field) {
            field.value = hsID;
          });
        }
      });
    }

    // get UTM params that are stored in the cookie and populate to available cookie input fields

    function addUtmCookies() {
      var utm = Cookies.get("utm");
      var usource, ucampaign, umedium, uterm;
      usource = JSON.parse(utm).source;
      ucampaign = JSON.parse(utm).campaign;
      umedium = JSON.parse(utm).medium;
      uterm = JSON.parse(utm).term;
      var utmSourceFields = ['#utmsource, [name*="utm_source"]'];
      var utmMediumFields = ['#utmmedium, [name*="utm_medium"]'];
      var utmCampaignFields = ['#utmcampaign, [name*="utm_campaign"]'];
      var utmTermFields = ['#utmterm, [name*="utm_term"]'];

      var currutmSourceFields,
        currutmMediumFields,
        currutmCampaignFields,
        currutmTermFields;

      // get all source inputs
      utmSourceFields.forEach(function (field) {
        if (document.querySelectorAll(field)) {
          currutmSourceFields = document.querySelectorAll(field);
        }
      });
      // get all medium inputs
      utmMediumFields.forEach(function (field) {
        if (document.querySelectorAll(field)) {
          currutmMediumFields = document.querySelectorAll(field);
        }
      });
      // get all campaign inputs
      utmCampaignFields.forEach(function (field) {
        if (document.querySelectorAll(field)) {
          currutmCampaignFields = document.querySelectorAll(field);
        }
      });
      // get all term inputs
      utmTermFields.forEach(function (field) {
        if (document.querySelectorAll(field)) {
          currutmTermFields = document.querySelectorAll(field);
        }
      });

      currutmSourceFields.forEach(function (field) {
        field.value = usource;
      });
      currutmMediumFields.forEach(function (field) {
        field.value = umedium;
      });
      currutmCampaignFields.forEach(function (field) {
        field.value = ucampaign;
      });
      currutmTermFields.forEach(function (field) {
        field.value = uterm;
      });
    }

    function otherFormFields() {
      document.querySelectorAll("#countryCode").forEach(function (field) {
        field.value = sessionStorage.getItem("clientLoc");
      });
      document.querySelectorAll("#pageName").forEach(function (field) {
        field.value = document.title;
      });
      document.querySelectorAll("#pageURI").forEach(function (field) {
        field.value = document.URL;
      });
      document
        .querySelectorAll('[name*="client_user_agent"]')
        .forEach(function (field) {
          field.value = window.navigator.userAgent;
        });
    }

    function addHubspotAds() {
      var utm = Cookies.get("utm");
      utm = JSON.parse(utm);
      var hsa_cam = utm.adcampaignid;
      var hsa_grp = utm.adsetid;
      var hsa_ad = utm.ad_id;

      var hsa_adFields = ['[name*="ad_id"]'];
      var hsa_camFields = ['[name*="ad_campaign_id"]'];
      var hsa_grpFields = ['[name*="ad_group_id"]'];

      var currhsa_adFields, currhsa_camFields, currhsa_grpFields;

      if (!hsa_cam) return;

      // get all hsa_ad
      hsa_adFields.forEach(function (field) {
        if (document.querySelectorAll(field)) {
          currhsa_adFields = document.querySelectorAll(field);
          currhsa_adFields.forEach(function (field) {
            field.value = hsa_ad;
          });
        }
      });
      // get all hsa_grp
      hsa_grpFields.forEach(function (field) {
        if (document.querySelectorAll(field)) {
          currhsa_grpFields = document.querySelectorAll(field);
          currhsa_grpFields.forEach(function (field) {
            field.value = hsa_grp;
          });
        }
      });
      // get all hsa_cam
      hsa_camFields.forEach(function (field) {
        if (document.querySelectorAll(field)) {
          currhsa_camFields = document.querySelectorAll(field);
          currhsa_camFields.forEach(function (field) {
            field.value = hsa_cam;
          });
        }
      });
    }
    function addEventId() {
      var fbEventId = ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(
        /[018]/g,
        (c) =>
          (
            c ^
            (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
          ).toString(16)
      );

      document
        .querySelectorAll('[name="facebook_event_id"]')
        .forEach(function (field) {
          field.value = fbEventId;
        });
    }
    function addExperimentTracking() {
      var propertyId = "UA-81405772-1";
      (function loop() {
        if (!Object.keys(gaData[propertyId].experiments)) {
          setTimeout(function () {
            loop();
          }, 3000);
        } else {
          var experimentIds = Object.keys(gaData[propertyId].experiments).join(
            ";"
          );
          var variantIds = Object.values(gaData[propertyId].experiments).join(
            ";"
          );

          document
            .querySelectorAll('[name="google_optimize_experiment_id"]')
            .forEach(function (field) {
              field.value = experimentIds;
            });

          document
            .querySelectorAll('[name="google_optimize_variant_id"]')
            .forEach(function (field) {
              field.value = variantIds;
            });
        }
      })();
    }
    addGclid();
    addFBid();
    addHSid();
    addUtmCookies();
    addHubspotAds();
    otherFormFields();
    addEventId();
    addExperimentTracking();
  }
});
