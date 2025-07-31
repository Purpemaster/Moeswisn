document.addEventListener('DOMContentLoaded', function(){
  const sweepDuration = 6000;
  const iconLinks = {
    "ping1": "https://www.bitmart.com/",
    "ping2": "https://slingshot.finance/",
    "ping3": "https://www.biconomy.io/",
    "ping4": "https://www.kcex.com/",
    "ping5": "https://www.lbank.info/",
    "ping6": "https://gate.io/",
    "ping7": "https://solcex.com/",
    "ping8": "https://robinhood.com/"
  };

  const pingAngles = {
    "ping1": 0,
    "ping2": 45,
    "ping3": 90,
    "ping4": 135,
    "ping5": 180,
    "ping6": 225,
    "ping7": 270,
    "ping8": 315
  };

  const pings = document.querySelectorAll('.ping');
  pings.forEach(ping => {
    ping.style.opacity = 0;
    ping.style.transition = 'opacity 0.2s ease-in-out';
    ping.style.cursor = 'pointer';
    const id = ping.classList[1];
    if (iconLinks[id]) ping.addEventListener('click', ()=> window.open(iconLinks[id], '_blank'));
  });

  function updateSweep(){
    const now = performance.now();
    const progress = (now % sweepDuration) / sweepDuration;
    const sweepAngle = progress * 360;
    pings.forEach(ping=>{
      const id = ping.classList[1];
      const angle = pingAngles[id];
      if (angle === undefined) return;
      const diff = Math.abs(sweepAngle-angle);
      const short = Math.min(diff, 360-diff);
      ping.style.opacity = short < 20 ? 1 : 0;
    });
    requestAnimationFrame(updateSweep);
  }
  updateSweep();
});
