# Ligação do GitHub, Supabase e Vercel

## 1. Supabase

Uma conta não é ainda uma base de dados: criar um projeto chamado Precision Building, idealmente numa região da UE. Guardar a password da base de dados num gestor de passwords.

1. No novo projeto, executar `database/setup.sql` no SQL Editor. Não executar na HousePro. O ficheiro é uma instalação inicial, não uma migração idempotente.
2. Em Authentication > Users, criar uma conta administrativa com email e password.
3. Em `database/bootstrap.sql`, substituir `SUBSTITUIR_EMAIL_ADMIN` pelo email e executar uma vez. Copiar o UUID mostrado para `PRECISION_ORGANIZATION_ID`.
4. Em Project Settings/API, obter Project URL e publishable key.
5. Criar contas de clientes em Authentication > Users. Após login como equipa, abrir a obra e usar “Associar cliente à obra”. Cada cliente pode acompanhar múltiplas obras.
6. Para adicionar equipa, obter o UUID do utilizador em Auth e inserir em `memberships` com o UUID da organização e role `staff` ou `admin`, através do SQL Editor. Não atribuir permissões por user_metadata.
7. Desativar registos públicos se a plataforma operar apenas por contas provisionadas. Configurar SMTP próprio antes de convites/emails de produção.

## 2. Vercel

Criar conta ou usar a existente. Em Add New > Project, importar `rsivales/precisionbuild`. Framework: Next.js. Root: raiz. Build: `npm run build`. Install: `npm ci`.

Variáveis em Project > Settings > Environment Variables:

| Nome | Valor | Exposição |
|---|---|---|
| NEXT_PUBLIC_SUPABASE_URL | URL do novo projeto | Pública |
| NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY | Publishable key | Pública; segurança depende de RLS |
| PRECISION_ORGANIZATION_ID | UUID do bootstrap | Servidor |
| SUPABASE_SECRET_KEY | Secret key do novo projeto | Segredo, apenas servidor |
| TURNSTILE_SECRET_KEY | Cloudflare Turnstile secret | Segredo, apenas servidor |
| NEXT_PUBLIC_TURNSTILE_SITE_KEY | Cloudflare Turnstile site key | Pública |

As últimas quatro habilitam os pedidos do website. Sem Turnstile o formulário fica desativado; login e gestão não dependem delas. Não partilhar secret keys numa conversa. Introduzir diretamente no painel Vercel. Configurar o domínio no Turnstile.

Fazer Deploy. Em Supabase Auth > URL Configuration, colocar a URL pública em Site URL e os redirects autorizados. Cada alteração a variáveis públicas requer um novo deployment.

## 3. Verificação antes de usar com clientes

1. Login administrador: criar uma obra, confirmar fases automáticas e criar decisão, reunião e parcela.
2. Criar dois clientes A/B e associar A à obra. A deve vê-la, B deve ver zero obras. Confirmar isto também no Data API com os tokens dos clientes, não apenas na interface.
3. Registo interno com visible_to_client=false: cliente A não o pode consultar.
4. Cliente A aprova uma decisão; auditoria regista o autor. Repetir a aprovação deve falhar. Cliente B não pode responder nem alterar quaisquer dados dessa obra.
5. Cliente A não pode marcar pagamentos como pagos nem alterar orçamento através da API.
6. Pedido público com Turnstile válido aparece no CRM; inválido é recusado. Anon não pode ler contactos.
7. Correr Supabase Security Advisors e resolver alertas antes de produção.
8. Confirmar recuperação e backups do projeto. Configurar retenção de dados e política de privacidade com os dados legais/contactos da empresa antes de ativar angariação pública.

## Limitações desta entrega

Build e tipos podem ser verificados sem Supabase. RLS, RPC, autenticação e submissão real só podem ser verificadas end-to-end após a nova conta/projeto estar ligado. O código não recebe a configuração da HousePro. Documents nesta versão são registos de referências, não ficheiros carregados. Reuniões têm data e detalhes, sem sincronização de calendário. Pagamentos são acompanhamento, não processamento/faturação.
