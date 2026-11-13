import React from 'react';
import { Link } from 'react-router-dom';
import useLanguage from '@/hooks/useLanguage';
import { pickBilingualText } from '@/utils/localizedContent';

interface KarchagFrameProps {
  labelKey?: string;
  label?: {
    tibetan: string;
    english: string;
  };
  link: string;
  /** @deprecated Label size is now fixed so text always fits inside the frame. */
  fontSize?: string;
}

const KarchagFrame: React.FC<KarchagFrameProps> = ({ labelKey, label, link }) => {
  const { isTibetan, t } = useLanguage();
  const translated = labelKey ? String(t(labelKey)) : '';
  const bilingual = pickBilingualText(isTibetan, label?.tibetan, label?.english);
  const labelText =
    labelKey && translated.trim() && translated !== labelKey
      ? translated
      : bilingual || translated;

  return (
    <Link to={link} className="block">
      <div className="relative w-full h-full flex flex-col items-center justify-center transform transition-transform hover:scale-105">
        <div className="relative w-64 h-[360px] flex items-center justify-center hover:bg-orange-100 transition-colors duration-300 rounded-lg">
          <img
            src="/frame.png"
            alt="Decorative frame"
            className="w-full h-full object-contain pointer-events-none select-none"
          />
          {/* Label is confined to the frame's inner panel (between the side borders,
              below the top ornament and above the lotus base) so it never overflows. */}
          <div className="absolute inset-x-[20%] top-[28%] bottom-[18%] flex items-center justify-center overflow-hidden">
            <span
              className={`block w-full text-center break-words hyphens-auto leading-snug ${
                isTibetan ? 'tibetan text-2xl' : 'text-xl md:text-2xl'
              }`}
              style={{ overflowWrap: 'anywhere' }}
            >
              {labelText}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default KarchagFrame;
