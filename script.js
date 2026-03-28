const revealTargets = document.querySelectorAll(
  ".panel, .loop-card, .pillar, .comparison-card, .timeline-card, .waitlist-section"
);

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  },
  { threshold: 0.18 }
);

revealTargets.forEach((node) => {
  node.classList.add("reveal");
  observer.observe(node);
});

document.querySelectorAll(".xp-ring").forEach((ring) => {
  const progress = Number(ring.dataset.progress || "0");
  ring.style.setProperty("--progress", String(progress));
});

const waitlistForm = document.getElementById("waitlist-form");
const formNote = document.getElementById("form-note");

waitlistForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(waitlistForm);
  const name = formData.get("name");
  const role = formData.get("role");

  formNote.textContent = `${name}, you are marked as ${role.toString().toLowerCase()} for the prototype waitlist.`;
  waitlistForm.reset();
});
