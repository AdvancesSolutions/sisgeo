import AppLayout from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, Server, Shield, Wifi, Map, FileText } from "lucide-react";

const Architecture = () => {
  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Documentação de Arquitetura</h1>
          <p className="text-sm text-muted-foreground mt-1">SIGEO — Sistema Integrado de Gestão Operacional</p>
        </div>
      </div>

      <Tabs defaultValue="data-model" className="w-full">
        <TabsList className="mb-6 flex-wrap h-auto gap-1">
          <TabsTrigger value="data-model" className="gap-1.5"><Database className="w-3.5 h-3.5" /> Modelo de Dados</TabsTrigger>
          <TabsTrigger value="api" className="gap-1.5"><Server className="w-3.5 h-3.5" /> API</TabsTrigger>
          <TabsTrigger value="anti-fraud" className="gap-1.5"><Shield className="w-3.5 h-3.5" /> Antifraude</TabsTrigger>
          <TabsTrigger value="offline" className="gap-1.5"><Wifi className="w-3.5 h-3.5" /> Offline/Sync</TabsTrigger>
          <TabsTrigger value="roadmap" className="gap-1.5"><Map className="w-3.5 h-3.5" /> Roadmap</TabsTrigger>
          <TabsTrigger value="security" className="gap-1.5"><FileText className="w-3.5 h-3.5" /> LGPD/Segurança</TabsTrigger>
        </TabsList>

        {/* ===== DATA MODEL ===== */}
        <TabsContent value="data-model">
          <div className="space-y-6">
            <Section title="Visão Geral do Modelo de Dados">
              <p>O sistema utiliza PostgreSQL (via Lovable Cloud / Supabase) com as seguintes tabelas principais organizadas por domínio.</p>
            </Section>

            <Section title="auth.users (Supabase Auth)">
              <CodeBlock>{`-- Gerenciado pelo Supabase Auth
-- Campos: id (UUID), email, encrypted_password, created_at, etc.
-- Relacionamento: 1:1 com profiles, 1:N com user_roles`}</CodeBlock>
            </Section>

            <Section title="profiles">
              <CodeBlock>{`CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  cpf TEXT UNIQUE,
  avatar_url TEXT,
  hire_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: usuário lê/edita próprio perfil; admin lê todos
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;`}</CodeBlock>
            </Section>

            <Section title="user_roles (RBAC)">
              <CodeBlock>{`CREATE TYPE app_role AS ENUM ('admin', 'supervisor', 'operator', 'inspector');

CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Security definer function para evitar recursão RLS
CREATE FUNCTION has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER
SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = _user_id AND role = _role
  )
$$;`}</CodeBlock>
            </Section>

            <Section title="sites (Unidades)">
              <CodeBlock>{`CREATE TABLE sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  geofence_radius_meters INT DEFAULT 200,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);`}</CodeBlock>
            </Section>

            <Section title="areas (Salas/Setores)">
              <CodeBlock>{`CREATE TABLE areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  floor TEXT,
  qr_code TEXT UNIQUE, -- para validação por QR/NFC
  created_at TIMESTAMPTZ DEFAULT NOW()
);`}</CodeBlock>
            </Section>

            <Section title="service_types (Tipos de Serviço)">
              <CodeBlock>{`CREATE TABLE service_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,         -- Ex: Limpeza, Manutenção, Inspeção
  sla_minutes INT DEFAULT 120,
  checklist JSONB DEFAULT '[]', -- Items do checklist parametrizável
  requires_photo_before BOOLEAN DEFAULT TRUE,
  requires_photo_after BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);`}</CodeBlock>
            </Section>

            <Section title="work_orders (Ordens de Serviço)">
              <CodeBlock>{`CREATE TYPE work_order_status AS ENUM (
  'pending', 'in_progress', 'validating', 'completed', 'rejected'
);
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high');

CREATE TABLE work_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,    -- Ex: OS-001
  title TEXT NOT NULL,
  description TEXT,
  service_type_id UUID REFERENCES service_types(id),
  site_id UUID REFERENCES sites(id) NOT NULL,
  area_id UUID REFERENCES areas(id),
  assignee_id UUID REFERENCES auth.users(id),
  status work_order_status DEFAULT 'pending',
  priority priority_level DEFAULT 'medium',
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  validated_at TIMESTAMPTZ,
  validated_by UUID REFERENCES auth.users(id),
  validation_notes TEXT,
  checklist_results JSONB DEFAULT '[]',
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_wo_status ON work_orders(status);
CREATE INDEX idx_wo_assignee ON work_orders(assignee_id);
CREATE INDEX idx_wo_site ON work_orders(site_id);
CREATE INDEX idx_wo_scheduled ON work_orders(scheduled_at);`}</CodeBlock>
            </Section>

            <Section title="work_order_photos">
              <CodeBlock>{`CREATE TYPE photo_type AS ENUM ('before', 'after');

CREATE TABLE work_order_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id UUID REFERENCES work_orders(id) ON DELETE CASCADE NOT NULL,
  type photo_type NOT NULL,
  storage_path TEXT NOT NULL,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  device_id TEXT,
  photo_hash TEXT NOT NULL,        -- SHA-256 para detectar duplicatas
  perceptual_hash TEXT,            -- pHash para fotos similares
  captured_at TIMESTAMPTZ NOT NULL,
  is_from_camera BOOLEAN DEFAULT TRUE, -- false = galeria (bloqueado)
  metadata JSONB,                  -- exif, resolução, etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_photo_hash ON work_order_photos(photo_hash);
CREATE INDEX idx_photo_wo ON work_order_photos(work_order_id);`}</CodeBlock>
            </Section>

            <Section title="time_clock (Ponto)">
              <CodeBlock>{`CREATE TYPE clock_event_type AS ENUM ('check_in', 'check_out');

CREATE TABLE time_clock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES auth.users(id) NOT NULL,
  site_id UUID REFERENCES sites(id) NOT NULL,
  event_type clock_event_type NOT NULL,
  event_at TIMESTAMPTZ NOT NULL,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  gps_accuracy DOUBLE PRECISION,
  is_within_geofence BOOLEAN,
  distance_from_site DOUBLE PRECISION,
  device_id TEXT,
  justification TEXT,              -- quando fora do geofence
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tc_employee ON time_clock(employee_id);
CREATE INDEX idx_tc_date ON time_clock(event_at);`}</CodeBlock>
            </Section>

            <Section title="materials & stock_movements">
              <CodeBlock>{`CREATE TABLE materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT,
  unit_of_measure TEXT DEFAULT 'un',
  min_stock INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE site_stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID REFERENCES materials(id) NOT NULL,
  site_id UUID REFERENCES sites(id) NOT NULL,
  current_stock INT DEFAULT 0,
  UNIQUE (material_id, site_id)
);

CREATE TABLE stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID REFERENCES materials(id) NOT NULL,
  site_id UUID REFERENCES sites(id) NOT NULL,
  work_order_id UUID REFERENCES work_orders(id),
  movement_type TEXT CHECK (movement_type IN ('in', 'out')) NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  reason TEXT,
  moved_by UUID REFERENCES auth.users(id),
  moved_at TIMESTAMPTZ DEFAULT NOW()
);`}</CodeBlock>
            </Section>

            <Section title="audit_logs">
              <CodeBlock>{`CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,     -- 'work_order', 'time_clock', etc.
  entity_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_date ON audit_logs(created_at);`}</CodeBlock>
            </Section>
          </div>
        </TabsContent>

        {/* ===== API ===== */}
        <TabsContent value="api">
          <div className="space-y-6">
            <Section title="Autenticação">
              <CodeBlock>{`POST /auth/signup
{ "email": "user@example.com", "password": "***", "full_name": "Maria Silva" }

POST /auth/login
{ "email": "user@example.com", "password": "***" }
→ { "access_token": "jwt...", "refresh_token": "...", "user": {...} }

POST /auth/refresh
{ "refresh_token": "..." }

POST /auth/reset-password
{ "email": "user@example.com" }`}</CodeBlock>
            </Section>

            <Section title="Ordens de Serviço">
              <CodeBlock>{`GET    /api/work-orders?status=pending&site_id=xxx&page=1&limit=20
POST   /api/work-orders
{
  "title": "Limpeza geral",
  "service_type_id": "uuid",
  "site_id": "uuid",
  "area_id": "uuid",
  "assignee_id": "uuid",
  "priority": "high",
  "scheduled_at": "2026-03-03T08:00:00Z",
  "checklist": ["Item 1", "Item 2"]
}

PATCH  /api/work-orders/:id/start
{ "photo_before": "<file>", "lat": -23.5505, "lng": -46.6333, "device_id": "xxx" }

PATCH  /api/work-orders/:id/complete
{
  "photo_after": "<file>",
  "lat": -23.5505, "lng": -46.6333,
  "checklist_results": [{"item": "Item 1", "done": true}],
  "materials_used": [{"material_id": "uuid", "qty": 2}],
  "notes": "Serviço concluído sem intercorrências."
}

PATCH  /api/work-orders/:id/validate
{ "action": "approve" | "reject", "notes": "Motivo..." }`}</CodeBlock>
            </Section>

            <Section title="Upload de Foto (com metadata)">
              <CodeBlock>{`POST /api/photos/upload
Content-Type: multipart/form-data

Fields:
  file: <binary>
  work_order_id: "uuid"
  type: "before" | "after"
  lat: -23.5505
  lng: -46.6333
  device_id: "device-uuid"
  captured_at: "2026-03-03T08:05:00Z"
  is_from_camera: true

→ Response:
{
  "id": "uuid",
  "storage_path": "photos/wo/uuid/before_xxx.jpg",
  "photo_hash": "sha256:abc123...",
  "is_within_geofence": true
}`}</CodeBlock>
            </Section>

            <Section title="Ponto (Time Clock)">
              <CodeBlock>{`POST /api/time-clock/check-in
{
  "site_id": "uuid",
  "lat": -23.5505,
  "lng": -46.6333,
  "gps_accuracy": 15.0,
  "device_id": "xxx"
}

POST /api/time-clock/check-out
{ "site_id": "uuid", "lat": ..., "lng": ..., "gps_accuracy": ..., "device_id": "xxx" }

GET /api/time-clock?employee_id=xxx&date=2026-03-03`}</CodeBlock>
            </Section>

            <Section title="Materiais">
              <CodeBlock>{`GET  /api/materials?site_id=xxx&below_min=true
POST /api/stock-movements
{
  "material_id": "uuid",
  "site_id": "uuid",
  "movement_type": "out",
  "quantity": 3,
  "work_order_id": "uuid",
  "reason": "Consumo em OS-003"
}`}</CodeBlock>
            </Section>

            <Section title="Webhooks / Integrações">
              <CodeBlock>{`// Eventos emitidos via webhook:
work_order.created
work_order.started
work_order.completed
work_order.validated
work_order.rejected
time_clock.check_in
time_clock.check_out
time_clock.gps_violation
stock.below_minimum

// Formato do webhook:
POST https://seu-endpoint.com/webhook
{
  "event": "work_order.rejected",
  "timestamp": "2026-03-03T15:42:00Z",
  "data": { "work_order_id": "uuid", "reason": "..." }
}

// Integrações planejadas:
- WhatsApp Business API (alertas)
- Email (SMTP via Edge Function)
- CSV Export (relatórios)
- ERP de estoque (via webhook ou API)
- Sistema de folha/ponto (exportação)`}</CodeBlock>
            </Section>
          </div>
        </TabsContent>

        {/* ===== ANTI-FRAUD ===== */}
        <TabsContent value="anti-fraud">
          <div className="space-y-6">
            <Section title="Regras de Ponto (Geofence)">
              <ul className="space-y-2 text-sm text-foreground">
                <li className="flex gap-2"><span className="text-danger font-bold">1.</span> <strong>GPS obrigatório:</strong> Sem GPS ativo, o registro é bloqueado. App exibe mensagem "Ative a localização para registrar ponto".</li>
                <li className="flex gap-2"><span className="text-danger font-bold">2.</span> <strong>Geofence com tolerância:</strong> Raio configurável por unidade (padrão: 200m). Distância calculada via fórmula de Haversine.</li>
                <li className="flex gap-2"><span className="text-danger font-bold">3.</span> <strong>Fora do raio:</strong> Registro permitido MAS exige justificativa textual obrigatória + aprovação do supervisor.</li>
                <li className="flex gap-2"><span className="text-danger font-bold">4.</span> <strong>Validação de horário:</strong> Tolerância de ±15min do horário previsto. Atraso acima disso gera alerta automático.</li>
                <li className="flex gap-2"><span className="text-danger font-bold">5.</span> <strong>Device fingerprint:</strong> device_id registrado para detectar check-ins de dispositivos diferentes.</li>
                <li className="flex gap-2"><span className="text-danger font-bold">6.</span> <strong>Trilha de auditoria:</strong> Cada evento de ponto gera log com GPS, accuracy, distância, device_id, timestamp do servidor.</li>
              </ul>
            </Section>

            <Section title="Regras de Foto (Serviço)">
              <ul className="space-y-2 text-sm text-foreground">
                <li className="flex gap-2"><span className="text-danger font-bold">1.</span> <strong>Foto obrigatória:</strong> Ao iniciar e ao concluir. Não é possível avançar sem foto.</li>
                <li className="flex gap-2"><span className="text-danger font-bold">2.</span> <strong>Somente câmera:</strong> App abre câmera diretamente. Bloqueio de galeria/arquivos.</li>
                <li className="flex gap-2"><span className="text-danger font-bold">3.</span> <strong>Hash SHA-256:</strong> Cada foto recebe hash único. Fotos duplicadas são detectadas e rejeitadas.</li>
                <li className="flex gap-2"><span className="text-danger font-bold">4.</span> <strong>Perceptual hash (pHash):</strong> Detecta fotos "quase iguais" (mesma cena com pequenas variações). Threshold configurável.</li>
                <li className="flex gap-2"><span className="text-danger font-bold">5.</span> <strong>GPS na foto:</strong> Coordenadas capturadas no momento da foto. Comparadas com geofence do local.</li>
                <li className="flex gap-2"><span className="text-danger font-bold">6.</span> <strong>Timestamp do servidor:</strong> Timestamp da foto comparado com timestamp do servidor (tolerância: 5min).</li>
                <li className="flex gap-2"><span className="text-danger font-bold">7.</span> <strong>Metadata EXIF:</strong> Registrado para auditoria (modelo do dispositivo, resolução, etc).</li>
              </ul>
            </Section>

            <Section title="Score Antifraude (V2)">
              <p className="text-sm text-muted-foreground mb-3">Na versão 2, cada registro recebe um score de confiança (0-100) baseado em:</p>
              <ul className="space-y-1 text-sm text-foreground">
                <li>• Distância GPS do local esperado (peso: 30%)</li>
                <li>• Consistência de timestamps (peso: 20%)</li>
                <li>• Unicidade da foto (hash + pHash) (peso: 25%)</li>
                <li>• Histórico do funcionário (peso: 15%)</li>
                <li>• Device fingerprint consistente (peso: 10%)</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-3">Score &lt; 60: revisão manual obrigatória. Score &lt; 30: bloqueio + alerta ao supervisor.</p>
            </Section>
          </div>
        </TabsContent>

        {/* ===== OFFLINE ===== */}
        <TabsContent value="offline">
          <div className="space-y-6">
            <Section title="Estratégia Offline-First (App Mobile)">
              <p className="text-sm text-muted-foreground mb-3">O app mobile (React Native) opera em modo offline-first com as seguintes regras:</p>
            </Section>

            <Section title="O que funciona offline">
              <ul className="space-y-1 text-sm text-foreground">
                <li>✅ Visualizar tarefas do dia (cache local)</li>
                <li>✅ Registrar check-in/check-out (fila local)</li>
                <li>✅ Tirar fotos e anexar a serviços (storage local)</li>
                <li>✅ Preencher checklists</li>
                <li>✅ Registrar consumo de materiais</li>
                <li>✅ Adicionar observações</li>
              </ul>
            </Section>

            <Section title="O que NÃO funciona offline">
              <ul className="space-y-1 text-sm text-foreground">
                <li>❌ Login (primeira autenticação requer internet)</li>
                <li>❌ Receber novas tarefas atribuídas</li>
                <li>❌ Aprovar/reprovar serviços (supervisor)</li>
                <li>❌ Notificações push</li>
                <li>❌ Relatórios e dashboards</li>
              </ul>
            </Section>

            <Section title="Sincronização">
              <CodeBlock>{`// Fila de eventos offline (IndexedDB / SQLite)
interface OfflineEvent {
  id: string;
  type: 'time_clock' | 'photo_upload' | 'work_order_update';
  payload: any;
  created_at: string;    // timestamp local
  synced: boolean;
  sync_attempts: number;
  last_error?: string;
}

// Estratégia de sync:
1. Ao recuperar conexão, processar fila FIFO
2. Retry com exponential backoff (1s, 2s, 4s, 8s, max 60s)
3. Máximo 5 tentativas por evento
4. Após 5 falhas: marcar como "erro" + notificar usuário

// Resolução de conflitos:
- Timestamp do servidor prevalece (server-wins)
- Eventos offline recebem flag "offline_created: true"
- Conflitos são logados na audit_logs para revisão`}</CodeBlock>
            </Section>
          </div>
        </TabsContent>

        {/* ===== ROADMAP ===== */}
        <TabsContent value="roadmap">
          <div className="space-y-6">
            <Section title="MVP (4-6 semanas)">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <RoadmapCard title="Web Admin" items={[
                  "Login/logout (admin e supervisor)",
                  "Dashboard com KPIs básicos",
                  "CRUD de ordens de serviço",
                  "Cadastro de locais e áreas",
                  "Cadastro de funcionários",
                  "Painel de validação (aprovar/reprovar)",
                  "Controle de ponto (visualização)",
                ]} />
                <RoadmapCard title="App Mobile" items={[
                  "Login (operador)",
                  "Lista de tarefas do dia",
                  "Iniciar serviço com foto",
                  "Concluir serviço com foto + checklist",
                  "Check-in/check-out com GPS",
                  "Modo offline básico (fila de eventos)",
                ]} />
              </div>
            </Section>

            <Section title="V1 (8-12 semanas)">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <RoadmapCard title="Web Admin" items={[
                  "Relatórios de produtividade e SLA",
                  "Gestão de materiais/estoque",
                  "Escalas e recorrência de tarefas",
                  "Trilha de auditoria completa",
                  "Notificações (email + WhatsApp)",
                  "Exportação CSV",
                  "RBAC completo (admin/supervisor/operador)",
                ]} />
                <RoadmapCard title="App Mobile" items={[
                  "Notificações push",
                  "QR Code/NFC para validação de presença",
                  "Consumo de materiais no serviço",
                  "Histórico de serviços + status",
                  "Chat por tarefa (funcionário ↔ supervisor)",
                  "Assinatura digital do supervisor",
                ]} />
              </div>
            </Section>

            <Section title="V2 (16-20 semanas)">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <RoadmapCard title="Inteligência" items={[
                  "Score antifraude automático",
                  "Previsão de demanda de materiais",
                  "Otimização de rotas (mapa do dia)",
                  "Alertas preditivos (SLA em risco)",
                  "Dashboard BI avançado",
                  "Integração ERP/Folha",
                ]} />
                <RoadmapCard title="Plataforma" items={[
                  "Multi-empresa/multi-unidade (tenancy)",
                  "Controle de EPI por função",
                  "Ocorrências/Chamados com foto",
                  "Assinatura do cliente/recepção",
                  "App para iOS e Android (publicação)",
                  "API pública para integrações",
                ]} />
              </div>
            </Section>
          </div>
        </TabsContent>

        {/* ===== SECURITY ===== */}
        <TabsContent value="security">
          <div className="space-y-6">
            <Section title="LGPD & Proteção de Dados">
              <ul className="space-y-2 text-sm text-foreground">
                <li><strong>Dados sensíveis:</strong> CPF, fotos com GPS e dados biométricos são classificados como dados pessoais sensíveis.</li>
                <li><strong>Base legal:</strong> Execução de contrato de trabalho (Art. 7°, V da LGPD) para ponto e fotos.</li>
                <li><strong>Consentimento:</strong> Funcionário assina termo de consentimento para coleta de GPS e fotos no ato da contratação.</li>
                <li><strong>Minimização:</strong> Coletar apenas dados estritamente necessários. GPS armazena coordenadas, não endereço completo.</li>
                <li><strong>Retenção:</strong> Fotos retidas por 12 meses, depois movidas para cold storage. Logs de auditoria retidos por 5 anos.</li>
                <li><strong>Direito de acesso:</strong> Funcionário pode solicitar exportação de seus dados (ponto, fotos, tarefas) via RH.</li>
                <li><strong>Anonimização:</strong> Após desligamento, dados são anonimizados após período de retenção legal.</li>
              </ul>
            </Section>

            <Section title="Autenticação & Autorização">
              <ul className="space-y-2 text-sm text-foreground">
                <li><strong>JWT + Refresh Token:</strong> Access token (15min) + Refresh token (7 dias). Rotação automática.</li>
                <li><strong>RBAC:</strong> 4 roles (admin, supervisor, operator, inspector) com permissões granulares via user_roles.</li>
                <li><strong>RLS (Row Level Security):</strong> Políticas no banco que garantem que usuário só acessa seus próprios dados.</li>
                <li><strong>Rate limiting:</strong> 100 req/min por usuário. Login: 5 tentativas a cada 15 min.</li>
                <li><strong>HTTPS obrigatório:</strong> Todas as comunicações via TLS 1.3.</li>
              </ul>
            </Section>

            <Section title="Storage de Fotos">
              <ul className="space-y-2 text-sm text-foreground">
                <li><strong>Bucket privado:</strong> Fotos armazenadas em bucket privado (Supabase Storage / S3).</li>
                <li><strong>URLs assinadas:</strong> Acesso via URLs temporárias (expira em 1h) geradas no backend.</li>
                <li><strong>Lifecycle:</strong> Hot (0-30 dias) → Warm (30-365 dias) → Cold/Archive (365+ dias).</li>
                <li><strong>Backup:</strong> Replicação automática em região secundária. RPO: 1h. RTO: 4h.</li>
                <li><strong>Thumbnail:</strong> Gerado automaticamente via Edge Function ao upload (200x200px).</li>
              </ul>
            </Section>

            <Section title="Observabilidade">
              <ul className="space-y-2 text-sm text-foreground">
                <li><strong>Logs estruturados:</strong> JSON com correlation_id, user_id, action, entity_type, timestamp.</li>
                <li><strong>Métricas:</strong> Tempo de resposta da API, taxa de erro, uploads/min, sync queue size.</li>
                <li><strong>Alertas:</strong> Erro 5xx &gt; 1% → alerta. Sync queue &gt; 100 eventos → alerta. Upload falha &gt; 3x → alerta.</li>
                <li><strong>Tracing:</strong> Request tracing com correlation_id para debug de fluxos complexos.</li>
              </ul>
            </Section>
          </div>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

// Helper components
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-card rounded-xl border border-border p-5">
    <h3 className="font-display font-semibold text-foreground mb-3">{title}</h3>
    <div className="text-foreground">{children}</div>
  </div>
);

const CodeBlock = ({ children }: { children: string }) => (
  <pre className="bg-muted/80 rounded-lg p-4 overflow-x-auto text-xs font-mono text-foreground leading-relaxed">
    {children}
  </pre>
);

const RoadmapCard = ({ title, items }: { title: string; items: string[] }) => (
  <div className="bg-muted/30 rounded-lg p-4">
    <h4 className="font-semibold text-foreground text-sm mb-2">{title}</h4>
    <ul className="space-y-1">
      {items.map((item, i) => (
        <li key={i} className="text-sm text-foreground flex gap-2">
          <span className="text-accent shrink-0">▸</span> {item}
        </li>
      ))}
    </ul>
  </div>
);

export default Architecture;
