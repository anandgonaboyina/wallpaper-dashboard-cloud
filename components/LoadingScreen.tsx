"use client";

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-[#050505] z-[9999] flex flex-col items-center justify-center text-white font-sans overflow-hidden opacity-100 pointer-events-auto">
      <style>{`
        @keyframes profileFlip {
          0% { transform: perspective(600px) rotateY(90deg) scale(0.8); opacity: 0; }
          50% { transform: perspective(600px) rotateY(-10deg) scale(1.05); opacity: 1; }
          100% { transform: perspective(600px) rotateY(0deg) scale(1); opacity: 1; }
        }
        .profile-flip {
          animation: profileFlip 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
      `}</style>
      
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-blue-500/10 rounded-full blur-[80px] md:blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center p-8 text-center max-w-lg w-full h-full justify-evenly">
        <div className="flex flex-col items-center w-full min-h-[250px] justify-center">
          <div className="flex flex-col items-center animate-in fade-in duration-700 w-full">
            <div className="relative w-24 h-24 md:w-32 md:h-32 mb-6 rounded-full overflow-hidden ring-4 ring-white/5 shadow-2xl shadow-blue-500/20 profile-flip opacity-0">
              <img
                src="/branding/author.jpeg"
                alt="Creator Profile"
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.src = '/icon-192x192.png' }}
              />
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300 fill-mode-both w-full">
              <h1 className="text-2xl md:text-4xl font-bold tracking-tight mb-3 bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
                Productive Dashboard
              </h1>
              <div className="text-[10px] md:text-xs font-mono text-blue-400 mb-8 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 inline-block">
                Cloud Sync Enabled
              </div>

              <p className="text-sm md:text-base text-white/50 leading-relaxed max-w-md mx-auto">
                "Built to eliminate distractions and create a single, unified workspace.
                Everything you need to stay deeply focused, plan your day, and track your goals—now available anywhere."
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center mt-8 animate-in fade-in duration-1000 delay-500 fill-mode-both">
          <div className="relative flex items-center justify-center mb-5">
            <div className="w-12 h-12 border-4 border-white/5 border-t-blue-500 rounded-full animate-spin" />
            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-b-purple-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          </div>
          <div className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase text-white/40 animate-pulse">
            Authenticating & Syncing Data...
          </div>
        </div>
      </div>
    </div>
  );
}
