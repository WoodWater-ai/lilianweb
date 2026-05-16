const Hero = () => {
  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="gradient-hero text-white min-h-screen flex items-center relative overflow-hidden pt-20">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,107,53,0.15),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(255,107,53,0.1),transparent_40%)]" />

      <div className="max-w-[1400px] mx-auto px-[5%] grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
        {/* Left Content */}
        <div>
          <div className="inline-block bg-primary-orange/20 border border-primary-orange/30 px-4 py-2 rounded-full text-sm font-semibold mb-6 animate-fade-in-up">
            🚀 行业首个Agent智能解决方案
          </div>

          <h1 className="text-5xl lg:text-6xl font-black leading-tight mb-6 tracking-tight animate-fade-in-up">
            一站式<span className="text-gradient-orange">礼品兑换</span>解决方案
          </h1>

          <p className="text-xl mb-10 opacity-90 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            为礼品公司提供完整的兑换系统，包含管理后台 + 移动商城 + Agent智能助手
            <br />
            助力企业轻松开展礼品兑换业务，AI驱动效率提升10倍
          </p>

          <div className="flex gap-4 flex-wrap animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <button
              onClick={() => scrollTo('cta')}
              className="gradient-orange text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-2xl shadow-primary-orange/40 hover:shadow-primary-orange/50 hover:-translate-y-1 transition-all flex items-center gap-2"
            >
              免费试用
              <span>→</span>
            </button>
            <button
              onClick={() => scrollTo('agent')}
              className="bg-white/10 text-white px-8 py-4 rounded-xl font-semibold text-lg border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all backdrop-blur-sm"
            >
              了解Agent
            </button>
          </div>
        </div>

        {/* Right Mockup */}
        <div className="animate-fade-in-right" style={{ animationDelay: '0.3s' }}>
          <div className="w-full max-w-[600px] mx-auto rounded-2xl shadow-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-8 border border-white/10">
            {/* Mockup Header */}
            <div className="flex gap-2 mb-6">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>

            {/* Mockup Content */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Agent处理效率', sub: '较人工提升', value: '10倍' },
                { label: '自动化率', sub: '业务流程', value: '85%' },
                { label: '响应时间', sub: '平均处理', value: '<3秒' },
                { label: '准确率', sub: '任务执行', value: '99.2%' },
              ].map((item, index) => (
                <div
                  key={index}
                  className="bg-white/5 rounded-xl p-6 border border-white/10"
                >
                  <h4 className="text-white text-sm mb-1">{item.label}</h4>
                  <p className="text-gray-400 text-xs mb-2">{item.sub}</p>
                  <div className="text-3xl font-extrabold text-gradient-orange">
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
