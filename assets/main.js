/* Northbridge IT — demo behaviour: mobile nav, scroll reveals, contact form. */
(function () {
  "use strict";

  /* ---------------------------------------------------------- mobile nav */
  var burger = document.querySelector(".burger");
  var nav = document.getElementById("nav");

  if (burger && nav) {
    burger.addEventListener("click", function () {
      var open = burger.getAttribute("aria-expanded") === "true";
      burger.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("is-open", !open);
    });

    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        burger.setAttribute("aria-expanded", "false");
        nav.classList.remove("is-open");
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        burger.setAttribute("aria-expanded", "false");
        nav.classList.remove("is-open");
      }
    });
  }

  /* ------------------------------------------------------- scroll reveal */
  var rise = document.querySelectorAll("[data-rise]");
  if (!("IntersectionObserver" in window)) {
    Array.prototype.forEach.call(rise, function (el) { el.classList.add("is-in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var delay = parseInt(el.getAttribute("data-rise"), 10) || 0;
        setTimeout(function () { el.classList.add("is-in"); }, delay);
        io.unobserve(el);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    Array.prototype.forEach.call(rise, function (el) { io.observe(el); });
  }

  /* ---------------------------------------------------------------- form */
  var form = document.querySelector("form.contact");
  if (!form) return;

  var status = document.getElementById("form-status");
  var EMAIL = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

  function fail(input, message) {
    input.setAttribute("aria-invalid", "true");
    var slot = document.getElementById(input.id + "-err");
    if (slot) slot.textContent = message;
  }

  function clear(input) {
    input.removeAttribute("aria-invalid");
    var slot = document.getElementById(input.id + "-err");
    if (slot) slot.textContent = "";
  }

  function check(input) {
    var v = (input.value || "").trim();

    if (input.hasAttribute("required") && !v) {
      fail(input, "This field is required.");
      return false;
    }
    if (input.type === "email" && v && !EMAIL.test(v)) {
      fail(input, "Enter a valid email address.");
      return false;
    }
    if (input.id === "message" && v && v.length < 15) {
      fail(input, "A little more detail, please (15+ characters).");
      return false;
    }
    clear(input);
    return true;
  }

  var fields = form.querySelectorAll("input:not([type=hidden]):not(.hp), select, textarea");

  Array.prototype.forEach.call(fields, function (input) {
    input.addEventListener("blur", function () { check(input); });
    input.addEventListener("input", function () {
      if (input.getAttribute("aria-invalid") === "true") check(input);
    });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // honeypot — bots fill hidden fields, humans never see them
    var pot = form.querySelector(".hp input");
    if (pot && pot.value) return;

    var ok = true;
    var firstBad = null;

    Array.prototype.forEach.call(fields, function (input) {
      if (input.classList.contains("hp")) return;
      if (!check(input)) {
        ok = false;
        if (!firstBad) firstBad = input;
      }
    });

    if (!ok) {
      if (firstBad) firstBad.focus();
      return;
    }

    var firstName = (form.querySelector("#name").value || "").trim().split(" ")[0];
    var button = form.querySelector("button[type=submit]");
    var buttonLabel = button ? button.innerHTML : "";

    function say(text, isError) {
      status.textContent = text;
      status.classList.add("is-on");
      status.classList.toggle("is-error", !!isError);
      status.focus();
    }

    function restoreButton() {
      if (!button) return;
      button.disabled = false;
      button.innerHTML = buttonLabel;
    }

    if (button) {
      button.disabled = true;
      button.innerHTML = "Sending…";
    }

    fetch("send.php", { method: "POST", body: new FormData(form) })
      .then(function (res) {
        return res.text().then(function (text) {
          var data = null;
          try { data = JSON.parse(text); } catch (err) { /* not JSON */ }
          return { status: res.status, data: data };
        });
      })
      .then(function (res) {
        restoreButton();

        // No JSON back means PHP never ran — i.e. we're on the static preview,
        // which serves send.php as plain text. Say so rather than pretend.
        if (res.data === null) {
          say("Thanks " + firstName + " — the form works, but this preview has no mail server behind it, so nothing was actually sent. On the live site this lands in Sales@Xervix.com.au.");
          form.reset();
          Array.prototype.forEach.call(fields, clear);
          return;
        }

        if (res.data.ok) {
          say("Thanks " + firstName + " — your message has been received. We'll come back to you within one business day.");
          form.reset();
          Array.prototype.forEach.call(fields, clear);
          return;
        }

        // Server-side validation disagreed with the browser: show it per field.
        if (res.data.errors) {
          var firstKey = null;
          Object.keys(res.data.errors).forEach(function (key) {
            var input = document.getElementById(key);
            if (input) fail(input, res.data.errors[key]);
            if (!firstKey) firstKey = key;
          });
          say("Please check the highlighted fields.", true);
          var el = firstKey && document.getElementById(firstKey);
          if (el) el.focus();
          return;
        }

        say(res.data.error || "Something went wrong. Please email Sales@Xervix.com.au directly.", true);
      })
      .catch(function () {
        restoreButton();
        say("We couldn't send that — please check your connection, or email Sales@Xervix.com.au directly.", true);
      });
  });

  /* --------------------------------------------------------- footer year */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
