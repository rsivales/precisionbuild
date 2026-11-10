import type { Metadata } from "next";
import Link from "next/link";
import Brand from "@/components/Brand";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description:
    "Como a Precision Build trata os dados enviados pelo website e pelos formulários de contacto no Facebook e Instagram.",
};

const email = "precisionbuild2026@gmail.com";

export default function PrivacyPage() {
  return (
    <>
      <header className="public-header">
        <Brand />
        <Link href="/">Voltar ao início</Link>
      </header>
      <main className="privacy-page">
        <h1>Política de Privacidade</h1>
        <p>Última atualização: 10 de novembro de 2026.</p>

        <h2>Quem trata os seus dados</h2>
        <p>
          A Tranquil Search, Lda., que utiliza a marca Precision Build neste
          website e nas respetivas campanhas, é responsável pelo tratamento dos
          dados abrangidos por esta política. Para questões de privacidade ou
          para exercer os seus direitos, escreva para{" "}
          <a href={`mailto:${email}`}>{email}</a>.
        </p>

        <h2>Que dados recebemos</h2>
        <p>
          Quando pede informações, uma visita ou um orçamento no website ou num
          formulário de anúncio no Facebook ou Instagram, recebemos os dados que
          escolhe enviar. Conforme o formulário, podem incluir o nome, email,
          telefone, tipo de serviço, localização e detalhes que descreva sobre o
          projeto. Nos formulários instantâneos, alguns campos podem vir
          preenchidos pela Meta e são enviados quando submete o formulário.
        </p>
        <p>
          O envio é voluntário. Sem um contacto válido ou informação suficiente
          sobre o pedido, poderemos não conseguir responder ou preparar uma
          proposta. Não inclua dados de saúde, documentos de identificação ou
          outros dados sensíveis nos formulários de contacto.
        </p>

        <h2>Para que usamos os dados e com que fundamento</h2>
        <ul>
          <li>
            Para responder ao pedido, esclarecer detalhes, combinar uma visita e
            preparar um orçamento ou proposta solicitada: diligências
            pré-contratuais a seu pedido, quando aplicável (artigo 6.º, n.º 1,
            alínea b), do RGPD). Em pedidos gerais de informação, o fundamento é
            o interesse legítimo em gerir e responder ao contacto (alínea f)).
          </li>
          <li>
            Se avançarmos com o projeto, para gerir o contrato e, quando
            aplicável, a conta e o acompanhamento da obra no portal de cliente:
            execução do contrato (alínea b)). Para cumprir obrigações legais,
            como as de faturação, aplica-se a alínea c).
          </li>
          <li>
            Para manter o website e os formulários seguros, diagnosticar falhas
            e prevenir abuso: interesse legítimo em proteger o serviço e os
            dados (alínea f)). Para estes fins podem ser tratados dados
            técnicos, como o endereço IP e registos de acesso.
          </li>
        </ul>
        <p>
          Enviar um pedido permite-nos responder e acompanhá-lo. Por si só, não
          autoriza o envio de campanhas promocionais futuras. Não usamos os
          dados do pedido para tomar decisões com efeitos legais ou semelhantes
          baseadas exclusivamente em tratamento automatizado.
        </p>

        <h2>Quem pode receber os dados</h2>
        <p>
          O acesso é limitado às pessoas autorizadas que gerem o pedido e aos
          prestadores necessários para o tratar, como serviços de alojamento do
          website (Vercel), base de dados e autenticação (Supabase, quando
          utilizadas), correio eletrónico e proteção de formulários contra
          abuso. Se a avaliação ou execução da obra exigir a intervenção de um
          técnico ou prestador, partilhamos apenas a informação necessária para
          essa intervenção. Podemos comunicar dados às autoridades competentes
          quando a lei o exigir.
        </p>
        <p>
          Quando usa um formulário instantâneo no Facebook ou Instagram, a Meta
          trata dados no âmbito dos seus serviços de acordo com a sua{" "}
          <a href="https://www.facebook.com/privacy/policy/">
            Política de Privacidade
          </a>
          . A presente política explica o tratamento pela Tranquil Search, Lda.
          dos contactos que lhe são disponibilizados.
        </p>
        <p>
          Quando um prestador tratar dados fora do Espaço Económico Europeu, as
          transferências serão efetuadas com base numa decisão de adequação ou
          em garantias adequadas, como cláusulas contratuais-tipo, conforme
          aplicável. Pode pedir informação sobre as garantias e uma cópia
          através do email acima indicado.
        </p>

        <h2>Durante quanto tempo guardamos os dados</h2>
        <p>
          Conservamos os dados do contacto durante a análise e o acompanhamento
          do pedido. Se não avançar para contrato, o critério para o apagamento
          é o encerramento do pedido e o fim da necessidade de acompanhar a
          proposta ou responder a questões pendentes. Havendo contrato,
          conservamos os dados necessários à execução e, depois, durante os
          prazos legais aplicáveis. Se for necessário preservar informação para
          resolver uma reclamação ou defender direitos, conservamos apenas os
          dados relevantes durante o período necessário para esse fim.
        </p>

        <h2>Armazenamento no navegador</h2>
        <p>
          A área reservada pode guardar informação no navegador para manter a
          sessão iniciada. Quando o formulário do website inclui um controlo
          contra pedidos automatizados, esse controlo pode tratar dados técnicos
          necessários para validar o envio.
        </p>

        <h2>Os seus direitos</h2>
        <p>
          Pode pedir acesso, correção ou apagamento dos seus dados, a limitação
          do tratamento e, quando aplicável, a portabilidade. Pode também
          opor-se ao tratamento baseado em interesse legítimo. Se algum
          tratamento depender do seu consentimento, pode retirá-lo a qualquer
          momento, sem afetar o tratamento anterior à retirada.
        </p>
        <p>
          Para exercer estes direitos, contacte{" "}
          <a href={`mailto:${email}`}>{email}</a>. Pode ainda apresentar
          reclamação à{" "}
          <a href="https://www.cnpd.pt/cidadaos/participacoes/">
            Comissão Nacional de Proteção de Dados (CNPD)
          </a>
          .
        </p>
      </main>
      <footer>
        <Brand dark />
        <Link href="/">Voltar ao início</Link>
      </footer>
    </>
  );
}
