import React from 'react';

const Footer = () => {
  return (
    <footer className="mt-auto bg-white/20 dark:bg-black/20 backdrop-blur border-t border-white/20 dark:border-white/10">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white/10 dark:bg-black/20 backdrop-blur rounded-2xl border border-white/20 dark:border-white/10 p-6">
          <div className="text-center space-y-4">
            {/* Título del footer */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="h-6 w-6 rounded-full bg-white/20 dark:bg-white/20 text-white grid place-items-center text-sm backdrop-blur">🎵</div>
              <h3 className="text-lg font-semibold text-white dark:text-white">
                MoodSync
              </h3>
            </div>

            {/* Información del desarrollador */}
            <div className="space-y-2">
              <p className="text-white/90 dark:text-white/90 font-medium">
                🎨 Desarrollado por Maximiliano Solis
              </p>
              <a 
                href="https://github.com/mesolisdev" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-white hover:text-white/80 transition-colors font-medium"
              >
                🔗 GitHub: @mesolisdev
              </a>
            </div>

            {/* Stack tecnológico */}
            <div className="pt-4 border-t border-white/20 dark:border-white/20">
              <p className="text-sm text-white/80 dark:text-white/80 mb-3">
                🛠️ Construido con:
              </p>
              <div className="flex flex-wrap justify-center gap-3 text-sm">
                <span className="px-3 py-1 bg-white/10 dark:bg-white/10 text-white rounded-full border border-white/20 dark:border-white/20 backdrop-blur">
                  ⚛️ React
                </span>
                <span className="px-3 py-1 bg-white/10 dark:bg-white/10 text-white rounded-full border border-white/20 dark:border-white/20 backdrop-blur">
                  🟢 Node.js
                </span>
                <span className="px-3 py-1 bg-white/10 dark:bg-white/10 text-white rounded-full border border-white/20 dark:border-white/20 backdrop-blur">
                  🚀 Express
                </span>
                <span className="px-3 py-1 bg-white/10 dark:bg-white/10 text-white rounded-full border border-white/20 dark:border-white/20 backdrop-blur">
                  🎨 Tailwind CSS
                </span>
                <span className="px-3 py-1 bg-white/10 dark:bg-white/10 text-white rounded-full border border-white/20 dark:border-white/20 backdrop-blur">
                  🎵 Spotify Web API
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
