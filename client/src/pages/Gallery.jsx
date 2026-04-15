import { useState } from 'react';
import { Camera, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Placeholder gallery items
const GALLERY_ITEMS = [
  { id: 1, url: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=600', vehicle: '2020 Toyota Supra', parts: 'Full Carbon Kit', user: 'Jason M.' },
  { id: 2, url: 'https://images.unsplash.com/photo-1584060622420-0673aad46072?w=600', vehicle: '2019 BMW M3', parts: 'Carbon Hood + Spoiler', user: 'Alex K.' },
  { id: 3, url: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600', vehicle: '2021 Porsche 911', parts: 'Carbon Diffuser', user: 'Chris L.' },
  { id: 4, url: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600', vehicle: '2018 Subaru WRX', parts: 'Side Skirts + Canards', user: 'Mike T.' },
  { id: 5, url: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=600', vehicle: '2022 Honda Civic', parts: 'Carbon Trunk Lid', user: 'Sam R.' },
  { id: 6, url: 'https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=600', vehicle: '2020 Nissan GT-R', parts: 'Full Aero Package', user: 'David N.' },
];

export default function Gallery() {
  const [selected, setSelected] = useState(null);

  return (
    <div className="pt-[88px] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="w-8 h-px bg-brand-red" />
            <Camera className="text-brand-red" size={18} />
            <span className="w-8 h-px bg-brand-red" />
          </div>
          <h1 className="font-display font-bold text-4xl dark:text-white text-gray-900 mb-3">Customer Builds</h1>
          <p className="dark:text-gray-400 text-gray-500 max-w-md mx-auto">Real builds from real customers. Show off yours with #LexsCarbon</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {GALLERY_ITEMS.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="relative group cursor-pointer overflow-hidden rounded-xl aspect-square"
              onClick={() => setSelected(item)}
            >
              <img src={item.url} alt={item.vehicle} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <p className="text-white font-heading font-bold text-sm">{item.vehicle}</p>
                <p className="text-gray-300 text-xs">{item.parts}</p>
                <p className="text-brand-red text-xs font-medium mt-0.5">— {item.user}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Lightbox */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
              onClick={() => setSelected(null)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="relative max-w-3xl w-full"
                onClick={e => e.stopPropagation()}
              >
                <img src={selected.url} alt={selected.vehicle} className="w-full rounded-xl" />
                <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/80 rounded-b-xl">
                  <p className="text-white font-heading font-bold text-lg">{selected.vehicle}</p>
                  <p className="text-gray-300 text-sm">{selected.parts}</p>
                  <p className="text-brand-red text-sm font-medium mt-0.5">— {selected.user}</p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="absolute top-3 right-3 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-brand-red transition-colors"
                >
                  <X size={16} />
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload CTA */}
        <div className="text-center mt-16 dark:bg-dark-surface bg-white border dark:border-dark-border border-light-border rounded-xl p-8">
          <Camera size={32} className="mx-auto mb-3 text-brand-red" />
          <h3 className="font-heading font-bold text-xl dark:text-white text-gray-900 mb-2">Show Us Your Build</h3>
          <p className="dark:text-gray-400 text-gray-500 text-sm mb-5">Tag us on Instagram @LexsCarbonCustoms or use #LexsCarbon</p>
          <a href="#" className="btn-primary inline-flex">Follow on Instagram</a>
        </div>
      </div>
    </div>
  );
}
