// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  });
});

// Add animation on scroll
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px',
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// Observe all sections for animation
document.addEventListener('DOMContentLoaded', () => {
  const sections = document.querySelectorAll(
    '.feature, .step, .intro, .tech-stack, .ai-powered, .get-started'
  );

  sections.forEach((section) => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
  });
});

// Add hover effect for feature cards
document.querySelectorAll('.feature').forEach((feature) => {
  feature.addEventListener('mouseenter', function () {
    this.style.borderLeft = '4px solid var(--accent-green)';
  });

  feature.addEventListener('mouseleave', function () {
    this.style.borderLeft = 'none';
  });
});

// Console easter egg
console.log(
  '%c🏌️‍♂️ Par-Tracker 42 🤖',
  'color: #2c5530; font-size: 24px; font-weight: bold;'
);
console.log(
  '%cThe Ultimate Answer to Your Golf Score Tracking Needs',
  'color: #4a7c59; font-size: 14px; font-style: italic;'
);
console.log(
  '%cBuilt with 💚 by TheBIMsider',
  'color: #6a6a6a; font-size: 12px;'
);
