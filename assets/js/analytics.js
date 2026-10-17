(function () {
    "use strict";

    const GA_MEASUREMENT_ID = "G-ES38YM2KS3";
    const analyticsScript = document.currentScript;
    const tagManagerId = analyticsScript?.dataset.tagManager || "";
    const deferAnalytics = analyticsScript?.dataset.deferAnalytics === "true";
    const workerAnalytics = analyticsScript?.dataset.workerAnalytics === "true" && "serviceWorker" in navigator;

    // Optional advertising IDs. Leave blank until the corresponding account
    // has been configured. Keeping them here avoids scattering IDs across pages.
    const META_PIXEL_ID = "";
    const LINKEDIN_PARTNER_ID = "";
    const LINKEDIN_CONVERSIONS = {
        contact_form: "",
        demo_request: "",
        donexia_signup: ""
    };

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () {
        window.dataLayer.push(arguments);
    };

    let analyticsStarted = false;
    function startAnalytics() {
        if (analyticsStarted) return;
        analyticsStarted = true;
        const url = tagManagerId
            ? `https://www.googletagmanager.com/gtm.js?id=${tagManagerId}`
            : `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
        if (!Array.from(document.scripts).some(script => script.src === url)) {
            const googleScript = document.createElement("script");
            googleScript.async = true;
            if (workerAnalytics) googleScript.type = "text/partytown";
            googleScript.src = url;
            document.head.appendChild(googleScript);
            if (workerAnalytics) window.dispatchEvent(new CustomEvent("ptupdate"));
        }
    }

    if (tagManagerId) {
        // Let the existing GTM container configure GA once; do not load it twice.
        window.dataLayer.push({"gtm.start": Date.now(), event: "gtm.js"});
    } else {
        window.gtag("js", new Date());
        window.gtag("config", GA_MEASUREMENT_ID);
    }
    if (deferAnalytics) {
        const scheduleAnalytics = () => {
            if ("requestIdleCallback" in window) requestIdleCallback(startAnalytics, {timeout:1500});
            else setTimeout(startAnalytics, 0);
        };
        if (document.readyState === "complete") scheduleAnalytics();
        else window.addEventListener("load", scheduleAnalytics, {once:true});
        // Early interactions flush queued events even if the page is still loading.
        document.addEventListener("pointerdown", startAnalytics, {once:true, passive:true});
        document.addEventListener("keydown", startAnalytics, {once:true});
    } else startAnalytics();

    if (META_PIXEL_ID && typeof window.fbq !== "function") {
        const fbq = window.fbq = function () {
            fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments);
        };
        if (!window._fbq) window._fbq = fbq;
        fbq.push = fbq;
        fbq.loaded = true;
        fbq.version = "2.0";
        fbq.queue = [];

        const metaScript = document.createElement("script");
        metaScript.async = true;
        metaScript.src = "https://connect.facebook.net/en_US/fbevents.js";
        document.head.appendChild(metaScript);

        window.fbq("init", META_PIXEL_ID);
        window.fbq("track", "PageView");
    }

    if (LINKEDIN_PARTNER_ID && typeof window.lintrk !== "function") {
        window._linkedin_partner_id = LINKEDIN_PARTNER_ID;
        window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
        window._linkedin_data_partner_ids.push(LINKEDIN_PARTNER_ID);
        window.lintrk = function (command, options) {
            window.lintrk.q.push([command, options]);
        };
        window.lintrk.q = [];

        const linkedInScript = document.createElement("script");
        linkedInScript.async = true;
        linkedInScript.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
        document.head.appendChild(linkedInScript);
    }

    window.trackEvent = function (eventName, parameters = {}) {
        const eventData = {
            page_path: window.location.pathname,
            ...parameters
        };

        window.gtag("event", eventName, eventData);

        if (typeof window.fbq === "function") {
            if (eventName === "generate_lead") {
                window.fbq("track", "Lead", {
                    content_name: parameters.lead_type || "contact_form"
                });
            } else if (eventName === "sign_up") {
                window.fbq("track", "CompleteRegistration", {
                    content_name: parameters.product || "Donexia"
                });
            }
        }

        const linkedinId = LINKEDIN_CONVERSIONS[parameters.lead_type] ||
            (eventName === "sign_up" ? LINKEDIN_CONVERSIONS.donexia_signup : "");

        if (linkedinId && typeof window.lintrk === "function") {
            window.lintrk("track", { conversion_id: Number(linkedinId) });
        }
    };

    document.addEventListener("click", function (event) {
        const link = event.target.closest("a[href]");
        if (!link) return;

        const href = link.getAttribute("href") || "";
        const location = link.dataset.trackLocation || "page";

        if (href.startsWith("tel:")) {
            window.trackEvent("phone_click", { link_location: location });
        } else if (href.includes("wa.me/") || href.includes("api.whatsapp.com/")) {
            window.trackEvent("whatsapp_click", { link_location: location });
        }

        if (link.dataset.trackEvent) {
            window.trackEvent(link.dataset.trackEvent, {
                lead_type: link.dataset.leadType || undefined,
                link_location: location
            });
        }
    });
})();
