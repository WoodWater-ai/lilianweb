import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import AgentSection from './components/AgentSection';
import './index.css';

function App() {
  useEffect(() => {
    // Intersection Observer for scroll animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <AgentSection />

      {/* Features Section */}
      <section id="features" className="py-32 bg-gray-50">
        <div className="max-w-[1400px] mx-auto px-[5%]">
          <div className="text-center max-w-[800px] mx-auto mb-20">
            <div className="inline-block bg-primary-orange/10 text-primary-orange px-4 py-2 rounded-full text-sm font-semibold mb-4">
              核心优势
            </div>
            <h2 className="text-4xl lg:text-5xl font-extrabold mb-4 tracking-tight">
              为什么选择我们？
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              专为礼品公司设计，一站式解决兑换业务全流程，助力企业数字化转型
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: '🤖',
                title: 'Agent智能助手',
                desc: '行业首个AI Agent解决方案，自然语言交互，自动执行业务操作，效率提升10倍。',
              },
              {
                icon: '🎯',
                title: '完整业务闭环',
                desc: '从商品管理、订单处理到物流跟踪，提供完整的兑换业务流程管理，无需多个系统切换。',
              },
              {
                icon: '🏢',
                title: '多租户架构',
                desc: '支持渠道-租户二级架构，礼品公司可管理多个客户，每个客户数据独立隔离，安全可靠。',
              },
              {
                icon: '📱',
                title: '移动端优先',
                desc: '专为移动端设计的H5商城，用户体验流畅，支持扫码兑换、智能地址识别等便捷功能。',
              },
              {
                icon: '⚡',
                title: '快速部署',
                desc: '标准化SaaS服务，开通即用，无需技术团队维护，专注业务发展即可。',
              },
              {
                icon: '🔒',
                title: '安全可靠',
                desc: '企业级安全架构，数据加密传输，权限精细控制，保障业务数据安全。',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white p-10 rounded-2xl border border-gray-200 hover:shadow-xl hover:-translate-y-2 transition-all group relative overflow-hidden animate-on-scroll"
              >
                <div className="absolute top-0 left-0 right-0 h-1 gradient-orange transform scale-x-0 group-hover:scale-x-100 transition-transform" />
                <div className="w-14 h-14 bg-primary-orange/10 rounded-xl flex items-center justify-center mb-6 text-3xl group-hover:gradient-orange group-hover:scale-110 transition-all">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section id="architecture" className="py-32 bg-white">
        <div className="max-w-[1400px] mx-auto px-[5%]">
          <div className="text-center max-w-[800px] mx-auto mb-20">
            <div className="inline-block bg-primary-orange/10 text-primary-orange px-4 py-2 rounded-full text-sm font-semibold mb-4">
              系统架构
            </div>
            <h2 className="text-4xl lg:text-5xl font-extrabold mb-4 tracking-tight">
              一体化解决方案
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              管理后台 + 移动商城 + Agent助手，完美协同，打造完整业务闭环
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[
              {
                icon: '🖥️',
                title: '管理后台',
                features: [
                  '商品管理：增删改查、批量操作',
                  '订单管理：状态跟踪、批量发货',
                  '分类管理：多级分类树形结构',
                  '礼包管理：组合商品灵活配置',
                  '卡密管理：虚拟商品自动发卡',
                  '组织架构：渠道-租户二级管理',
                  '权限控制：RBAC角色权限体系',
                  '数据报表：可视化图表分析',
                ],
              },
              {
                icon: '📱',
                title: '移动商城',
                features: [
                  '双登录模式：兑换码/手机号',
                  '商品浏览：网格展示、详情查看',
                  '智能兑换：扫码识别、规格选择',
                  '订单跟踪：状态筛选、物流查询',
                  '地址管理：智能解析、自动识别',
                  '深色模式：护眼主题切换',
                  '流畅动画：Motion动画效果',
                  '响应式设计：完美适配移动端',
                ],
              },
            ].map((arch, index) => (
              <div
                key={index}
                className="bg-gray-50 p-10 rounded-2xl border border-gray-200 hover:shadow-lg transition-all animate-on-scroll"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 gradient-orange rounded-xl flex items-center justify-center text-white text-2xl">
                    {arch.icon}
                  </div>
                  <h3 className="text-2xl font-bold">{arch.title}</h3>
                </div>
                <ul className="space-y-4">
                  {arch.features.map((feature, fIndex) => (
                    <li
                      key={fIndex}
                      className="flex items-center gap-4 py-2 border-b border-gray-200 last:border-0 hover:pl-2 transition-all"
                    >
                      <div className="w-6 h-6 bg-primary-orange/10 rounded-full flex items-center justify-center text-primary-orange font-bold text-xs flex-shrink-0">
                        ✓
                      </div>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-32 bg-white">
        <div className="max-w-[1400px] mx-auto px-[5%]">
          <div className="text-center max-w-[800px] mx-auto mb-20">
            <div className="inline-block bg-primary-orange/10 text-primary-orange px-4 py-2 rounded-full text-sm font-semibold mb-4">
              客户评价
            </div>
            <h2 className="text-4xl lg:text-5xl font-extrabold mb-4 tracking-tight">
              客户成功案例
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              已服务数百家礼品公司，助力业务增长
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                quote:
                  'Agent功能太强大了！以前需要3个人处理一天的订单，现在Agent自动处理，效率提升了10倍，准确率还更高。',
                author: '张总监',
                role: '某大型礼品公司运营总监',
              },
              {
                quote:
                  '多租户架构非常适合我们，可以同时服务多个企业客户，数据隔离做得很好。Agent助手让我们的客服效率提升了300%。',
                author: '李总经理',
                role: '某渠道代理商总经理',
              },
              {
                quote:
                  '智能地址识别和Agent自动处理功能太实用了，大大减少了人工错误，用户体验显著提升，客户满意度达到98%。',
                author: '王负责人',
                role: '某电商平台负责人',
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="bg-gray-50 p-10 rounded-2xl border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all relative animate-on-scroll"
              >
                <div className="absolute top-4 left-8 text-6xl text-primary-orange opacity-10 font-serif leading-none">
                  "
                </div>
                <p className="text-gray-600 leading-relaxed mb-6 relative z-10">
                  {testimonial.quote}
                </p>
                <div className="font-semibold text-gray-900">{testimonial.author}</div>
                <div className="text-gray-500 text-sm mt-1">{testimonial.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="py-32 gradient-hero text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,107,53,0.2),transparent)]" />

        <div className="max-w-[800px] mx-auto px-[5%] relative z-10">
          <h2 className="text-4xl lg:text-5xl font-extrabold mb-6 tracking-tight">
            立即开通，开启智能兑换新时代
          </h2>
          <p className="text-xl mb-10 opacity-90">
            免费试用 · Agent赋能 · 效率提升10倍
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button className="gradient-orange text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-2xl shadow-primary-orange/40 hover:shadow-primary-orange/50 hover:-translate-y-1 transition-all">
              申请试用
            </button>
            <button className="bg-white/10 text-white px-8 py-4 rounded-xl font-semibold text-lg border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all backdrop-blur-sm">
              联系我们
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-20">
        <div className="max-w-[1400px] mx-auto px-[5%]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🎁</span>
                <span className="text-2xl font-extrabold text-gradient-orange">
                  礼品兑换系统
                </span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                行业首个Agent智能解决方案，为礼品公司提供一站式兑换服务，助力企业数字化转型，效率提升10倍。
              </p>
              <div className="mt-6 text-gray-400">
                <p className="mb-2">礼享科技团队</p>
                <p>联系电话：18657192015</p>
              </div>
            </div>

            {[
              {
                title: '产品服务',
                links: ['管理后台', '移动商城', 'Agent助手', 'API接口'],
              },
              {
                title: '解决方案',
                links: ['礼品公司', '企业福利', '积分商城', '会员兑换'],
              },
              {
                title: '支持帮助',
                links: ['使用文档', '视频教程', '常见问题', '联系客服'],
              },
            ].map((section, index) => (
              <div key={index}>
                <h4 className="text-lg font-semibold mb-6">{section.title}</h4>
                <ul className="space-y-3">
                  {section.links.map((link, lIndex) => (
                    <li key={lIndex}>
                      <a
                        href="#"
                        className="text-gray-400 hover:text-white hover:pl-1 transition-all text-sm"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>© 2024 礼享科技. 行业首个Agent智能解决方案. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
