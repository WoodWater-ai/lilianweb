const AgentSection = () => {
  return (
    <section id="agent" className="py-32 gradient-agent relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,107,53,0.1),transparent_50%)]" />

      <div className="max-w-[1400px] mx-auto px-[5%] grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
        {/* Left - Agent Diagram */}
        <div className="w-full max-w-[500px] mx-auto">
          {[
            { icon: '🤖', title: '智能理解', desc: '自然语言指令，自动识别业务意图' },
            { icon: '⚡', title: '自动执行', desc: '自动调用系统功能，完成业务操作' },
            { icon: '✅', title: '智能反馈', desc: '实时反馈执行结果，支持人工确认' },
          ].map((node, index) => (
            <div key={index}>
              <div className="bg-white rounded-2xl p-6 mb-4 shadow-lg border-2 border-primary-orange hover:shadow-xl hover:shadow-primary-orange/20 hover:-translate-y-1 transition-all">
                <h4 className="text-lg font-bold text-primary-orange mb-2 flex items-center gap-2">
                  <span>{node.icon}</span>
                  {node.title}
                </h4>
                <p className="text-gray-600 text-sm">{node.desc}</p>
              </div>
              {index < 2 && (
                <div className="text-center text-3xl text-primary-orange my-2 animate-bounce-slow">
                  ↓
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Right - Agent Text */}
        <div>
          <h2 className="text-4xl lg:text-5xl font-extrabold mb-6 tracking-tight">
            行业首个<span className="text-gradient-orange">Agent智能解决方案</span>
          </h2>

          <p className="text-lg text-gray-600 leading-relaxed mb-8">
            告别繁琐的手动操作，让AI Agent成为您的智能助手。通过自然语言指令，Agent自动理解业务需求，调用系统功能，快速完成订单处理、商品管理、数据分析等复杂操作，效率提升10倍。
          </p>

          <ul className="space-y-4">
            {[
              {
                icon: '💬',
                title: '自然语言交互',
                desc: '无需学习复杂操作，用自然语言即可指挥Agent完成任务',
              },
              {
                icon: '🔄',
                title: '自动化业务流程',
                desc: '批量处理订单、自动发货、智能分类，解放人力',
              },
              {
                icon: '📊',
                title: '智能数据分析',
                desc: '自动生成报表、识别异常、提供决策建议',
              },
              {
                icon: '🎯',
                title: '精准执行',
                desc: '99.2%的准确率，支持人工审核确认机制',
              },
            ].map((feature, index) => (
              <li key={index} className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary-orange/10 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-gray-600">{feature.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default AgentSection;
