import { useState, useEffect } from 'react';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'h-[70px] shadow-lg'
          : 'h-20'
      } bg-white/98 backdrop-blur-xl border-b border-black/5`}
      style={{ padding: '0 5%' }}
    >
      <div className="max-w-[1400px] mx-auto h-full flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 gradient-orange rounded-xl flex items-center justify-center text-white text-xl">
            🎁
          </div>
          <span className="text-2xl font-extrabold text-gradient-orange tracking-tight">
            礼品兑换系统
          </span>
        </div>

        {/* Navigation Links */}
        <ul className="hidden md:flex gap-10 list-none">
          {[
            { label: 'Agent解决方案', id: 'agent' },
            { label: '产品特色', id: 'features' },
            { label: '系统架构', id: 'architecture' },
            { label: '客户案例', id: 'testimonials' },
          ].map((item) => (
            <li key={item.id}>
              <button
                onClick={() => scrollTo(item.id)}
                className="text-gray-600 font-medium text-[0.95rem] hover:text-primary-orange transition-colors relative group"
              >
                {item.label}
                <span className="absolute bottom-[-5px] left-0 w-0 h-0.5 bg-primary-orange transition-all group-hover:w-full" />
              </button>
            </li>
          ))}
        </ul>

        {/* CTA Button */}
        <button
          onClick={() => scrollTo('cta')}
          className="gradient-orange text-white px-6 py-2.5 rounded-lg font-semibold text-[0.95rem] shadow-lg shadow-primary-orange/30 hover:shadow-xl hover:shadow-primary-orange/40 hover:-translate-y-0.5 transition-all"
        >
          立即开通
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
