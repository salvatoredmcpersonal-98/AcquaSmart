@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

@import "tailwindcss";
@import "react-grid-layout/css/styles.css";
@import "react-resizable/css/styles.css";

@layer utilities {
  @keyframes wiggle {
    0% { transform: rotate(0deg); }
    25% { transform: rotate(0.5deg); }
    75% { transform: rotate(-0.5deg); }
    100% { transform: rotate(0deg); }
  }

  .animate-wiggle {
    animation: wiggle 0.3s infinite;
  }
}

body {
  @apply bg-zinc-900 font-sans antialiased;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

@layer utilities {
  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    @apply bg-transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    @apply bg-white/10 rounded-full;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    @apply bg-white/20;
  }
}
