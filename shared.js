const cards = document.querySelectorAll('.card');

if (cards.length) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal');
      }
    });
  }, { threshold: 0.14 });

  cards.forEach((card, index) => {
    card.style.transitionDelay = (index % 4) * 70 + 'ms';
    observer.observe(card);
  });
}
