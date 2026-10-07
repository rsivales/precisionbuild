import Link from "next/link";
import Brand from "@/components/Brand";
import Enquiry from "@/components/Enquiry";
export default function Home() {
  return (
    <>
      <header className="public-header">
        <Brand />
        <nav>
          <a href="#solucoes">Soluções</a>
          <a href="#processo">Como trabalhamos</a>
          <Link href="/acesso">Área de cliente</Link>
          <a className="button" href="#contacto">
            Falar sobre o projeto
          </a>
        </nav>
      </header>
      <main>
        <section className="hero">
          <div className="eyebrow">
            CONSTRUÇÃO LSF · REABILITAÇÃO · RENOVAÇÃO
          </div>
          <h1>
            Precisão em cada fase.
            <br />
            <span>Confiança até à entrega.</span>
          </h1>
          <p>
            A sua ideia merece uma obra bem planeada. Da primeira conversa à
            entrega, acompanhe a execução e saiba o que acontece a seguir.
          </p>
          <div className="actions">
            <a className="button" href="#contacto">
              Vamos construir o seu projeto
            </a>
            <a className="text-link" href="#processo">
              Conhecer o processo
            </a>
          </div>
          <div className="hero-bottom">
            <span>01 / PLANEAMENTO</span>
            <span>02 / EXECUÇÃO</span>
            <span>03 / ENTREGA</span>
          </div>
        </section>
        <section id="solucoes" className="section">
          <div className="eyebrow">SOLUÇÕES</div>
          <h2>
            Uma nova casa.
            <br />
            Uma nova vida para o seu espaço.
          </h2>
          <div className="service-grid">
            {[
              [
                "01",
                "Construção LSF",
                "Construção com estrutura de aço leve, planeada de acordo com o projeto e as necessidades de cada cliente.",
              ],
              [
                "02",
                "Reabilitação",
                "Recuperar o edifício, corrigir problemas e preparar o espaço para uma nova utilização.",
              ],
              [
                "03",
                "Renovação",
                "Transformar interiores, atualizar instalações e melhorar o conforto e a funcionalidade.",
              ],
            ].map(([n, title, text]) => (
              <article className="service" key={n}>
                <span className="number">{n}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>
        <section id="processo" className="process section">
          <div>
            <div className="eyebrow">UM PROCESSO CLARO</div>
            <h2>
              A sua obra.
              <br />
              Sempre consigo.
            </h2>
            <p>
              Um portal dedicado à sua obra, com as fases de execução e os
              momentos em que precisamos da sua participação.
            </p>
            <Link className="button" href="/acesso">
              Entrar no portal
            </Link>
          </div>
          <div>
            {[
              [
                "01",
                "Planeamento e proposta",
                "Definimos o âmbito, o orçamento e o calendário.",
              ],
              [
                "02",
                "Execução e acompanhamento",
                "Consulte o progresso e as atualizações da equipa.",
              ],
              [
                "03",
                "Decisões no momento certo",
                "Reuniões, escolhas de materiais e aprovações com datas claras.",
              ],
              [
                "04",
                "Pagamentos e entrega",
                "Acompanhe as parcelas previstas e a preparação da entrega.",
              ],
            ].map(([n, t, d]) => (
              <article className="process-row" key={n}>
                <span>{n}</span>
                <div>
                  <h3>{t}</h3>
                  <p>{d}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section id="contacto" className="section contact">
          <div>
            <div className="eyebrow">COMEÇAMOS POR UMA CONVERSA</div>
            <h2>
              O que quer
              <br />
              construir a seguir?
            </h2>
            <p>
              Conte-nos o que tem em mente. O pedido será analisado pela nossa
              equipa.
            </p>
          </div>
          <Enquiry />
        </section>
      </main>
      <footer>
        <Brand />
        <span>Precision Building · Construção com precisão.</span>
        <Link href="/acesso">Acesso da equipa</Link>
      </footer>
    </>
  );
}
