# Precision Building

Website público, CRM comercial e portal de acompanhamento de obras para LSF, reabilitação e renovação. Português de Portugal. Next.js, React, TypeScript e Supabase. Preparado para Vercel.

## Estado real

Primeira versão funcional do código. O ambiente de produção requer um projeto Supabase **novo e exclusivo**, aplicação do esquema e configuração no Vercel. Sem variáveis, o login informa que a ligação está pendente. `/demonstracao` usa apenas dados fictícios em memória, sem persistência. Não ligar ao projeto HousePro.

Implementado: website, login por palavra-passe, CRM com etapas, criação transacional de obras e fases por serviço, registo e atualização de fases/reuniões/pagamentos/diário/documentos por referência, portal, respostas a decisões, associação de clientes existentes, RLS por organização/obra e auditoria de alterações na base de dados. O progresso é calculado pelo número de fases concluídas, sem ponderação.

Ainda por implementar: uploads privados de fotografias/PDF, convites automáticos e recuperação de palavra-passe na interface, notificações por email/SMS, orçamentos com versões e assinatura, fornecedores e custos/margens, faturação certificada, cobrança online, edição completa de dados das obras, subscrições SaaS e administração de múltiplas organizações na interface. O esquema separa organizações, mas esta versão destina-se à operação da Precision Building; não constitui ainda um SaaS comercial completo.

## Desenvolvimento

Node.js 24.

```sh
npm ci
cp .env.example .env.local
npm run dev
npm run typecheck
npm run build
```

## Ligar a infraestrutura

Ver [docs/CONFIGURACAO.md](docs/CONFIGURACAO.md). Nunca guardar passwords, tokens, secret keys ou service-role keys no GitHub ou em variáveis `NEXT_PUBLIC_*`.

## Acessos

- `/`: website público.
- `/acesso`: login.
- `/gestao`: gestão; os dados são autorizados por RLS e clientes não recebem dados internos.
- `/portal`: vista de cliente; equipa pode alternar para gestão.
- `/demonstracao`: demonstração pública sem dados reais.

Os clientes só veem obras explicitamente associadas e registos marcados como visíveis. Podem responder a decisões pendentes da sua obra através de uma RPC com autorização na base de dados. Não podem alterar orçamento, pagamentos, datas ou fases. As alterações na base de dados são auditadas. Os administradores provisionam membros da equipa no SQL Editor nesta primeira versão.
