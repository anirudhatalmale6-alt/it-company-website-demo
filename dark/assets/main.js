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

    // Demo build: no mail server wired up yet. On the live site this posts to
    // the handler in /send.php (or a form service) and shows the same message.
    var name = (form.querySelector("#name").value || "").trim().split(" ")[0];
    status.textContent =
      "Thanks " + name + " — your message has been received. " +
      "We reply within one business day. [DEMO: not actually sent]";
    status.classList.add("is-on");
    status.focus();
    form.reset();
    Array.prototype.forEach.call(fields, clear);
  });

  /* --------------------------------------------------------- footer year */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
