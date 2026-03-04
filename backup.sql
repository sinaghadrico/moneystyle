--
-- PostgreSQL database dump
--

\restrict Msagtdc1z0Ogs0zWRV0zryOqWn6wYL0NoymwrZt9Dog8pLYNSrOT1dHSd7LiJmf

-- Dumped from database version 16.13
-- Dumped by pg_dump version 16.13

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: revenue
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO revenue;

--
-- Name: accounts; Type: TABLE; Schema: public; Owner: revenue
--

CREATE TABLE public.accounts (
    id text NOT NULL,
    name text NOT NULL,
    bank text,
    color text DEFAULT '#3b82f6'::text NOT NULL,
    icon text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.accounts OWNER TO revenue;

--
-- Name: ai_prompts; Type: TABLE; Schema: public; Owner: revenue
--

CREATE TABLE public.ai_prompts (
    id text NOT NULL,
    key text NOT NULL,
    content text NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.ai_prompts OWNER TO revenue;

--
-- Name: app_settings; Type: TABLE; Schema: public; Owner: revenue
--

CREATE TABLE public.app_settings (
    id text DEFAULT 'default'::text NOT NULL,
    currency text DEFAULT 'AED'::text NOT NULL,
    "defaultPageSize" integer DEFAULT 20 NOT NULL,
    "defaultAccountId" text,
    "defaultTransactionType" text DEFAULT 'expense'::text NOT NULL,
    "defaultDashboardPeriod" text DEFAULT '3m'::text NOT NULL,
    "autoCategorize" boolean DEFAULT true NOT NULL,
    "telegramEnabled" boolean DEFAULT false NOT NULL,
    "telegramBotToken" text,
    "telegramWebhookSecret" text,
    "telegramChatId" text,
    "smsApiKey" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "aiEnabled" boolean DEFAULT false NOT NULL,
    "openaiApiKey" text,
    "notifyMonthlyReport" boolean DEFAULT true NOT NULL,
    "notifyPaymentReminders" boolean DEFAULT true NOT NULL,
    "notifySmsTransaction" boolean DEFAULT true NOT NULL,
    "notifyWebTransaction" boolean DEFAULT true NOT NULL,
    "notifyWeekendPlan" boolean DEFAULT true NOT NULL
);


ALTER TABLE public.app_settings OWNER TO revenue;

--
-- Name: bill_payments; Type: TABLE; Schema: public; Owner: revenue
--

CREATE TABLE public.bill_payments (
    id text NOT NULL,
    "billId" text NOT NULL,
    amount numeric(12,2) NOT NULL,
    note text,
    "paidAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.bill_payments OWNER TO revenue;

--
-- Name: bills; Type: TABLE; Schema: public; Owner: revenue
--

CREATE TABLE public.bills (
    id text NOT NULL,
    name text NOT NULL,
    amount numeric(12,2) NOT NULL,
    currency text DEFAULT 'AED'::text NOT NULL,
    "dueDay" integer DEFAULT 1 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "reminderDays" integer DEFAULT 2 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.bills OWNER TO revenue;

--
-- Name: budgets; Type: TABLE; Schema: public; Owner: revenue
--

CREATE TABLE public.budgets (
    id text NOT NULL,
    "categoryId" text NOT NULL,
    "monthlyLimit" numeric(12,2) NOT NULL,
    "alertThreshold" integer DEFAULT 80 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.budgets OWNER TO revenue;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: revenue
--

CREATE TABLE public.categories (
    id text NOT NULL,
    name text NOT NULL,
    color text DEFAULT '#6b7280'::text NOT NULL,
    icon text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.categories OWNER TO revenue;

--
-- Name: currencies; Type: TABLE; Schema: public; Owner: revenue
--

CREATE TABLE public.currencies (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    symbol text NOT NULL,
    "rateToUsd" double precision DEFAULT 1.0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.currencies OWNER TO revenue;

--
-- Name: income_sources; Type: TABLE; Schema: public; Owner: revenue
--

CREATE TABLE public.income_sources (
    id text NOT NULL,
    name text NOT NULL,
    amount numeric(12,2) NOT NULL,
    "depositDay" integer DEFAULT 1 NOT NULL,
    currency text DEFAULT 'AED'::text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.income_sources OWNER TO revenue;

--
-- Name: installment_payments; Type: TABLE; Schema: public; Owner: revenue
--

CREATE TABLE public.installment_payments (
    id text NOT NULL,
    "installmentId" text NOT NULL,
    amount numeric(12,2) NOT NULL,
    note text,
    "paidAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.installment_payments OWNER TO revenue;

--
-- Name: installments; Type: TABLE; Schema: public; Owner: revenue
--

CREATE TABLE public.installments (
    id text NOT NULL,
    name text NOT NULL,
    amount numeric(12,2) NOT NULL,
    currency text DEFAULT 'AED'::text NOT NULL,
    "dueDay" integer DEFAULT 1 NOT NULL,
    "totalCount" integer,
    "paidCount" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "reminderDays" integer DEFAULT 2 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.installments OWNER TO revenue;

--
-- Name: item_groups; Type: TABLE; Schema: public; Owner: revenue
--

CREATE TABLE public.item_groups (
    id text NOT NULL,
    "canonicalName" text NOT NULL,
    "rawNames" text[],
    source text DEFAULT 'manual'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.item_groups OWNER TO revenue;

--
-- Name: meal_plans; Type: TABLE; Schema: public; Owner: revenue
--

CREATE TABLE public.meal_plans (
    id text NOT NULL,
    "weekLabel" text NOT NULL,
    plan jsonb NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.meal_plans OWNER TO revenue;

--
-- Name: merchant_category_rules; Type: TABLE; Schema: public; Owner: revenue
--

CREATE TABLE public.merchant_category_rules (
    id text NOT NULL,
    pattern text NOT NULL,
    "categoryId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.merchant_category_rules OWNER TO revenue;

--
-- Name: money_advices; Type: TABLE; Schema: public; Owner: revenue
--

CREATE TABLE public.money_advices (
    id text NOT NULL,
    summary text NOT NULL,
    "emergencyFundNeeded" double precision NOT NULL,
    "emergencyFundCurrent" double precision NOT NULL,
    "investableAmount" double precision NOT NULL,
    suggestions jsonb NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.money_advices OWNER TO revenue;

--
-- Name: notification_templates; Type: TABLE; Schema: public; Owner: revenue
--

CREATE TABLE public.notification_templates (
    id text NOT NULL,
    key text NOT NULL,
    content text NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.notification_templates OWNER TO revenue;

--
-- Name: persons; Type: TABLE; Schema: public; Owner: revenue
--

CREATE TABLE public.persons (
    id text NOT NULL,
    name text NOT NULL,
    phone text,
    color text DEFAULT '#6b7280'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.persons OWNER TO revenue;

--
-- Name: reserve_snapshots; Type: TABLE; Schema: public; Owner: revenue
--

CREATE TABLE public.reserve_snapshots (
    id text NOT NULL,
    "reserveId" text NOT NULL,
    amount numeric(12,2) NOT NULL,
    note text,
    "recordedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.reserve_snapshots OWNER TO revenue;

--
-- Name: reserves; Type: TABLE; Schema: public; Owner: revenue
--

CREATE TABLE public.reserves (
    id text NOT NULL,
    name text NOT NULL,
    amount numeric(12,2) NOT NULL,
    currency text DEFAULT 'AED'::text NOT NULL,
    type text NOT NULL,
    location text NOT NULL,
    note text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.reserves OWNER TO revenue;

--
-- Name: savings_goals; Type: TABLE; Schema: public; Owner: revenue
--

CREATE TABLE public.savings_goals (
    id text NOT NULL,
    name text NOT NULL,
    "targetAmount" numeric(12,2) NOT NULL,
    "currentAmount" numeric(12,2) DEFAULT 0 NOT NULL,
    deadline timestamp(3) without time zone,
    color text DEFAULT '#10b981'::text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.savings_goals OWNER TO revenue;

--
-- Name: settlements; Type: TABLE; Schema: public; Owner: revenue
--

CREATE TABLE public.settlements (
    id text NOT NULL,
    "personId" text NOT NULL,
    amount numeric(12,2) NOT NULL,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    note text,
    source text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.settlements OWNER TO revenue;

--
-- Name: shopping_list_items; Type: TABLE; Schema: public; Owner: revenue
--

CREATE TABLE public.shopping_list_items (
    id text NOT NULL,
    "listId" text NOT NULL,
    "itemName" text NOT NULL,
    "normalizedName" text DEFAULT ''::text NOT NULL,
    quantity double precision DEFAULT 1 NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.shopping_list_items OWNER TO revenue;

--
-- Name: shopping_lists; Type: TABLE; Schema: public; Owner: revenue
--

CREATE TABLE public.shopping_lists (
    id text NOT NULL,
    name text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.shopping_lists OWNER TO revenue;

--
-- Name: sms_patterns; Type: TABLE; Schema: public; Owner: revenue
--

CREATE TABLE public.sms_patterns (
    id text NOT NULL,
    name text NOT NULL,
    regex text NOT NULL,
    type text NOT NULL,
    priority integer DEFAULT 50 NOT NULL,
    "amountCaptureGroup" integer DEFAULT 1 NOT NULL,
    "merchantCaptureGroup" integer,
    enabled boolean DEFAULT true NOT NULL,
    "creditKeywords" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.sms_patterns OWNER TO revenue;

--
-- Name: tags; Type: TABLE; Schema: public; Owner: revenue
--

CREATE TABLE public.tags (
    id text NOT NULL,
    name text NOT NULL,
    color text DEFAULT '#6b7280'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.tags OWNER TO revenue;

--
-- Name: transaction_items; Type: TABLE; Schema: public; Owner: revenue
--

CREATE TABLE public.transaction_items (
    id text NOT NULL,
    "transactionId" text NOT NULL,
    name text NOT NULL,
    quantity double precision DEFAULT 1 NOT NULL,
    "unitPrice" double precision,
    "totalPrice" double precision NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "normalizedName" text DEFAULT ''::text NOT NULL
);


ALTER TABLE public.transaction_items OWNER TO revenue;

--
-- Name: transaction_splits; Type: TABLE; Schema: public; Owner: revenue
--

CREATE TABLE public.transaction_splits (
    id text NOT NULL,
    "transactionId" text NOT NULL,
    "categoryId" text,
    amount numeric(12,2) NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "personId" text
);


ALTER TABLE public.transaction_splits OWNER TO revenue;

--
-- Name: transaction_tags; Type: TABLE; Schema: public; Owner: revenue
--

CREATE TABLE public.transaction_tags (
    "transactionId" text NOT NULL,
    "tagId" text NOT NULL
);


ALTER TABLE public.transaction_tags OWNER TO revenue;

--
-- Name: transactions; Type: TABLE; Schema: public; Owner: revenue
--

CREATE TABLE public.transactions (
    id text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    "time" text,
    amount numeric(12,2),
    currency text DEFAULT 'AED'::text NOT NULL,
    type text NOT NULL,
    "categoryId" text,
    merchant text,
    description text,
    items text,
    source text,
    "hasReceipt" boolean DEFAULT false NOT NULL,
    "mediaFiles" text[],
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "mergedIntoId" text,
    "accountId" text NOT NULL,
    "spreadMonths" integer
);


ALTER TABLE public.transactions OWNER TO revenue;

--
-- Name: user_preferences; Type: TABLE; Schema: public; Owner: revenue
--

CREATE TABLE public.user_preferences (
    id text DEFAULT 'default'::text NOT NULL,
    entertainment text[],
    food text[],
    likes text[],
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    city text DEFAULT 'Dubai'::text NOT NULL,
    "companionType" text DEFAULT 'solo'::text NOT NULL
);


ALTER TABLE public.user_preferences OWNER TO revenue;

--
-- Name: weekend_plans; Type: TABLE; Schema: public; Owner: revenue
--

CREATE TABLE public.weekend_plans (
    id text NOT NULL,
    "weekLabel" text NOT NULL,
    plan jsonb NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "linkedTransactionIds" text[],
    ratings jsonb
);


ALTER TABLE public.weekend_plans OWNER TO revenue;

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: revenue
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
956923d1-18ec-42d2-b69f-7d3b5ef1429c	807b5fe6628d9dc2619dd38cbfbd4195a4f7f20361192e4d64d9426d6f5a2a3d	2026-03-03 07:04:12.477585+00	20260303070412_enhance_weekend_planner	\N	\N	2026-03-03 07:04:12.473722+00	1
94f33abd-51d1-40fb-9f29-528ec77b4ba6	becff72368e4eb4c63019f73998561eac0117a082169c4504b067d9324445cfc	2026-02-27 17:48:45.592136+00	20260227174845_init	\N	\N	2026-02-27 17:48:45.581244+00	1
c38c6a06-4b50-42b3-b118-b490248471fd	0d1ab6f1d05bc2bb1641523260ddcd0b4c407bd2ccb79c6b86912c97553992b7	2026-03-02 17:57:18.929194+00	20260302175718_add_reserve_snapshots	\N	\N	2026-03-02 17:57:18.921014+00	1
0e838a46-2183-4bd4-a8ac-a502e9dec6d5	09e679bfe5ec593b4a0ba4da3abe2be63021a50dc943360cdfdfe022d97f5d11	2026-02-27 18:31:58.108516+00	20260227183158_add_merge_support	\N	\N	2026-02-27 18:31:58.1044+00	1
37becb31-8d9f-4f17-9943-b1b91ea6f993	00856ef34552ca4eb484273134c51f810ebac67917a075883f0471940904c85d	2026-02-28 11:19:53.306688+00	20260228000000_add_accounts	\N	\N	2026-02-28 11:19:53.289301+00	1
de07b282-d2f7-4a8b-8506-0e188d6c1190	ff5ca29b961a39d646a7d3c9fac020ff63c44a32bdc7bd92d6e67d3e1ab59754	2026-03-01 12:42:38.614506+00	20260301124238_add_budgets_tags	\N	\N	2026-03-01 12:42:38.596099+00	1
d521189d-e871-4f95-82c7-9a1b29171b2a	5943a274f22676071923256752be71ef8124a9680fa60a556d87db2dc481c5ee	2026-03-02 18:15:01.287777+00	20260302181433_add_currency_table	\N	\N	2026-03-02 18:15:01.281497+00	1
60b61606-4217-42e8-873d-267c204420ab	0f407e0e4127091a2db537d70641fbd42d593fc64f9fda5abd0f0ca99b94a38d	2026-03-01 14:27:38.416336+00	20260301142738_add_merchant_rules_savings_goals_transaction_splits	\N	\N	2026-03-01 14:27:38.40321+00	1
6999e24a-4e8c-4449-850a-92e295140c58	d861c900c533e86b379fcf894333b0c01d47384fab21766be3135d766955ca07	2026-03-01 15:30:32.613896+00	20260301153032_add_person_settlement_models	\N	\N	2026-03-01 15:30:32.601557+00	1
1ecb210e-422e-4dcc-8ee7-1af4f6c2b68b	1caf8c625ff02b9fa0e9ddcc52b8eb8f6039b5bd91f67e10dffe2e794773dccc	2026-03-02 07:09:19.150699+00	20260302070919_add_app_settings	\N	\N	2026-03-02 07:09:19.143522+00	1
8f471052-ae49-4c7c-9e2f-c1483206d5c9	7ab8674ddbf9b9121062fb46c04bb32554e986d2d2af9f3658ad5e5f2eb47f82	2026-03-02 19:34:53.296537+00	20260302193453_add_installment_payments	\N	\N	2026-03-02 19:34:53.290895+00	1
81d55745-4dfb-4780-a1b0-7db139e78794	af2639bd7e990f0dace7533d689f07b1a7cb19e5eea141669f20df332bae9cd3	2026-03-02 07:54:38.833218+00	20260302075438_add_sms_patterns	\N	\N	2026-03-02 07:54:38.827694+00	1
ca29cafa-27f2-4b5f-a133-95cc3481df2e	94f73ad5bd8dc09e3864901dc2962634c224875cca7ceee3080c08972bdba650	2026-03-02 11:15:09.168669+00	20260302111509_add_transaction_items	\N	\N	2026-03-02 11:15:09.160603+00	1
0561407b-b2bf-4a81-8c48-70094d04dee7	b1268878462583194e104613fe64d638fc3e6d977d909644b3f024776340fc9d	2026-03-03 08:13:14.534067+00	20260303081314_add_notification_toggles	\N	\N	2026-03-03 08:13:14.529906+00	1
e85fa60a-18ee-4e87-99f4-d2cf9040d8ce	fd2d363366a11843570541a3cdee851833a226988b5a5791b6fc5918c9efdb49	2026-03-02 11:38:21.734575+00	20260302113821_add_ai_settings	\N	\N	2026-03-02 11:38:21.732692+00	1
55d4fed9-49c1-41d5-90d1-a9b578154d07	3df26802dd8dc0e162f5eb7fca83c74ab3ff0f9aa56f332a575f1bb04b6cfbd9	2026-03-02 20:21:49.639615+00	20260302202149_add_bills	\N	\N	2026-03-02 20:21:49.631116+00	1
88fc9f5d-ff95-486c-b9cb-25aeca485734	376aa9f4126f60dfee3ea9bc57a79bfc38309ef69799ef50c26e5da3e6bcdaaf	2026-03-02 13:39:41.614363+00	20260302133941_add_price_analysis	\N	\N	2026-03-02 13:39:41.606711+00	1
49b3a9f9-32a9-4999-b576-795169c885b8	9fe5c34f61524c2b334af6c911bbf09ef2c4326751df27b0ba159c8a11cad9f6	2026-03-02 15:36:11.826951+00	20260302153611_add_shopping_lists	\N	\N	2026-03-02 15:36:11.816405+00	1
facd7c7f-8119-42be-bda7-603addf1836a	a37f1bc1e72545ac6d80c383f0474dae6babf46d50db173ec08c021f01f8cb5a	2026-03-02 17:44:27.548899+00	20260302174427_add_profile_models	\N	\N	2026-03-02 17:44:27.537681+00	1
acb918c5-fbad-476b-a610-23294d22d99e	7efaa35b7cec19b451d5a47bad7d89707e9cc1e00697273710ab9afa45cc48fc	2026-03-02 20:50:26.376503+00	20260302205026_add_money_advice	\N	\N	2026-03-02 20:50:26.372055+00	1
bed7baa9-f3d2-46fc-82c7-e5cc17c2b997	cf8265ef6175c99d8bfa60d5afbb820c9df449bb937ae44f1af3ad0ad41dba0f	2026-03-02 21:07:37.999443+00	20260302210737_add_ai_prompts	\N	\N	2026-03-02 21:07:37.991816+00	1
47492007-3fdd-44d5-ad6c-aa02e9c1a217	fd40e1b76dd69ea5bd048102fd48af660b6819168f3b3e6320a39ca304ee9950	2026-03-03 08:19:44.891083+00	20260303081944_add_notification_templates	\N	\N	2026-03-03 08:19:44.884188+00	1
4f822d37-0343-42da-8da6-81fe5c78319a	7331d1a1190ffffb5843cd6191fff54a384faef9f371381f666b4d854a372c64	2026-03-02 21:46:32.622171+00	20260302214632_add_meal_plans	\N	\N	2026-03-02 21:46:32.617821+00	1
9c8173a1-b31e-4a90-b10e-74bfca46af61	b60bb510e05143b707e59f69ef438008397b4586238995b2c5799dfb7ec9a12c	2026-03-02 22:35:10.991041+00	20260302223510_add_weekend_planner	\N	\N	2026-03-02 22:35:10.983217+00	1
f8f0b1dc-2d95-4527-b41a-907795cb9315	9ba9960cdc14159f8e8c75c39bb40ce48a9ce36c2766a35bfc378ae2a81e7006	2026-03-03 09:26:35.804823+00	20260303092635_add_spread_months	\N	\N	2026-03-03 09:26:35.803149+00	1
\.


--
-- Data for Name: accounts; Type: TABLE DATA; Schema: public; Owner: revenue
--

COPY public.accounts (id, name, bank, color, icon, "createdAt", "updatedAt") FROM stdin;
default_farnoosh_mashreq	Farnoosh Mashreq	Mashreq	#3b82f6	\N	2026-02-28 11:19:53.29	2026-02-28 11:19:53.29
cmm6fbnk800008o9w89ze2ol6	Sina Mashreq	Mashreq	#10b981	\N	2026-02-28 14:35:56.553	2026-02-28 14:35:56.553
\.


--
-- Data for Name: ai_prompts; Type: TABLE DATA; Schema: public; Owner: revenue
--

COPY public.ai_prompts (id, key, content, "updatedAt") FROM stdin;
\.


--
-- Data for Name: app_settings; Type: TABLE DATA; Schema: public; Owner: revenue
--

COPY public.app_settings (id, currency, "defaultPageSize", "defaultAccountId", "defaultTransactionType", "defaultDashboardPeriod", "autoCategorize", "telegramEnabled", "telegramBotToken", "telegramWebhookSecret", "telegramChatId", "smsApiKey", "createdAt", "updatedAt", "aiEnabled", "openaiApiKey", "notifyMonthlyReport", "notifyPaymentReminders", "notifySmsTransaction", "notifyWebTransaction", "notifyWeekendPlan") FROM stdin;
default	AED	10	default_farnoosh_mashreq	expense	all	t	t	8607179820:AAEpXly56EUxvetXiz5IKLliR0D2v3lICNc	revenue-tg-wh-k8x2m9p4q7	166397304	a3f8b2c1d4e5	2026-03-02 07:21:19.969	2026-03-02 19:35:44.698	t	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	t	t	t	t	t
\.


--
-- Data for Name: bill_payments; Type: TABLE DATA; Schema: public; Owner: revenue
--

COPY public.bill_payments (id, "billId", amount, note, "paidAt") FROM stdin;
cmm9mmupz00028ohj32xkpa7w	cmm9mmk3100008ohjs6926f2z	520.00	\N	2026-03-02 20:23:54.887
\.


--
-- Data for Name: bills; Type: TABLE DATA; Schema: public; Owner: revenue
--

COPY public.bills (id, name, amount, currency, "dueDay", "isActive", "reminderDays", "createdAt", "updatedAt") FROM stdin;
cmm9mmk3100008ohjs6926f2z	Dewa	550.00	AED	1	t	2	2026-03-02 20:23:41.1	2026-03-02 20:23:41.1
\.


--
-- Data for Name: budgets; Type: TABLE DATA; Schema: public; Owner: revenue
--

COPY public.budgets (id, "categoryId", "monthlyLimit", "alertThreshold", "createdAt", "updatedAt") FROM stdin;
cmm7rzeig00048o25swfj3raj	cmm56s17800028ogefz2eqqt0	2000.00	80	2026-03-01 13:18:06.135	2026-03-01 13:18:06.135
cmm7s2mjn000a8o25kteoniq4	cmm5cqzf10001pw01d9pekwf0	1000.00	80	2026-03-01 13:20:36.515	2026-03-01 13:20:36.515
cmm7s08fs00068o25jl2c63ew	cmm56s17600018ogeqghk7vfb	1000.00	80	2026-03-01 13:18:44.897	2026-03-01 13:21:02.825
cmm7s3qos000e8o25w75lognw	cmm56s17f00078oge3yf8pp6g	1000.00	80	2026-03-01 13:21:28.539	2026-03-01 13:21:28.539
cmm7s4ooc000i8o25gzk7qnuc	cmm56s17900038ogeyynewip3	300.00	80	2026-03-01 13:22:12.589	2026-03-01 13:22:12.589
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: revenue
--

COPY public.categories (id, name, color, icon, "createdAt", "updatedAt") FROM stdin;
cmm56s17000008ogezghgfclk	deposit	#22c55e	\N	2026-02-27 17:48:57.996	2026-02-27 17:48:57.996
cmm56s17c00058ogea78vq636	other	#6b7280	\N	2026-02-27 17:48:58.008	2026-02-27 17:48:58.008
cmm56s17i00098oge2xb5or4t	transfer	#14b8a6	\N	2026-02-27 17:48:58.014	2026-02-27 17:48:58.014
cmm56s17900038ogeyynewip3	🚗 transport	#3b82f6	\N	2026-02-27 17:48:58.006	2026-02-27 20:15:51.956
cmm56s17a00048ogeacrpia4x	🖊️ utilities	#8b5cf6	\N	2026-02-27 17:48:58.007	2026-02-28 07:04:08.367
cmm56s17l000b8ogen8sv9jjw	subscription	#6b7280	\N	2026-02-27 17:48:58.017	2026-02-28 19:17:10.482
cmm56s17g00088oge05l6cktv	👚 clothing	#ec4899	\N	2026-02-27 17:48:58.013	2026-02-28 19:19:24.142
cmm60aoac0000ry015m0ptwvq	💧 water	#13aefb	\N	2026-02-28 07:35:16.596	2026-03-01 07:41:18.817
cmm56s17e00068ogeybi889nb	🏠 housing	#818dea	\N	2026-02-27 17:48:58.01	2026-03-01 07:41:56.219
cmm56s17j000a8ogezifv1oi1	🏥 healthcare	#ef4444	\N	2026-02-27 17:48:58.016	2026-03-01 07:42:21.873
cmm56s17600018ogeqghk7vfb	🥙 food	#f97316	\N	2026-02-27 17:48:58.003	2026-03-01 07:42:39.456
cmm56s17f00078oge3yf8pp6g	🎻 entertainment	#06b6d4	\N	2026-02-27 17:48:58.011	2026-03-01 07:43:05.624
cmm56s17m000c8ogerjdoev6e	🎒 education	#eab308	\N	2026-02-27 17:48:58.018	2026-03-01 07:43:33.958
cmm56s17800028ogefz2eqqt0	🍏 groceries	#84cc16	\N	2026-02-27 17:48:58.004	2026-03-01 07:44:11.087
cmm5ckzhy0000pw01vktsd04i	👷 company	#1a6b57	\N	2026-02-27 20:31:26.903	2026-03-01 07:45:03.398
cmm5cqzf10001pw01d9pekwf0	🍱 goods	#ff00f7	\N	2026-02-27 20:36:06.733	2026-03-01 08:43:41.408
\.


--
-- Data for Name: currencies; Type: TABLE DATA; Schema: public; Owner: revenue
--

COPY public.currencies (id, code, name, symbol, "rateToUsd", "isActive", "createdAt", "updatedAt") FROM stdin;
cur_aed	AED	UAE Dirham	د.إ	0.2723	t	2026-03-02 18:15:01.282	2026-03-02 18:15:01.282
cur_usd	USD	US Dollar	$	1	t	2026-03-02 18:15:01.282	2026-03-02 18:15:01.282
cur_eur	EUR	Euro	€	1.0838	t	2026-03-02 18:15:01.282	2026-03-02 18:15:01.282
cur_gbp	GBP	British Pound	£	1.2614	t	2026-03-02 18:15:01.282	2026-03-02 18:15:01.282
cur_sar	SAR	Saudi Riyal	ر.س	0.2667	t	2026-03-02 18:15:01.282	2026-03-02 18:15:01.282
cur_try	TRY	Turkish Lira	₺	0.02778	t	2026-03-02 18:15:01.282	2026-03-02 18:15:01.282
cur_irr	IRR	Iranian Rial	﷼	5.9541e-07	t	2026-03-02 18:15:01.282	2026-03-02 19:22:15.411
\.


--
-- Data for Name: income_sources; Type: TABLE DATA; Schema: public; Owner: revenue
--

COPY public.income_sources (id, name, amount, "depositDay", currency, "isActive", "createdAt", "updatedAt") FROM stdin;
cmm9ham8a00008o8jfrgyxv1p	Salary	19215.00	5	AED	t	2026-03-02 17:54:25.929	2026-03-02 17:54:25.929
\.


--
-- Data for Name: installment_payments; Type: TABLE DATA; Schema: public; Owner: revenue
--

COPY public.installment_payments (id, "installmentId", amount, note, "paidAt") FROM stdin;
cmm9lj3b500068ocrel5r1c5o	cmm9lb14y00038ocrt8stznia	10000000.00	\N	2026-03-02 19:52:59.777
cmm9lj7tn00088ocr7nadbzqj	cmm9lb14y00038ocrt8stznia	10000000.00	\N	2026-03-02 19:53:05.627
\.


--
-- Data for Name: installments; Type: TABLE DATA; Schema: public; Owner: revenue
--

COPY public.installments (id, name, amount, currency, "dueDay", "totalCount", "paidCount", "isActive", "reminderDays", "createdAt", "updatedAt") FROM stdin;
cmm9ldicn00048ocrfb61w4n8	Melat Bank Loan	55812000.00	IRR	27	60	48	t	2	2026-03-02 19:48:39.333	2026-03-02 19:48:39.333
cmm9lb14y00038ocrt8stznia	Saderat Bank Loan	10000000.00	IRR	26	120	24	t	2	2026-03-02 19:46:43.713	2026-03-02 19:53:14.832
\.


--
-- Data for Name: item_groups; Type: TABLE DATA; Schema: public; Owner: revenue
--

COPY public.item_groups (id, "canonicalName", "rawNames", source, "createdAt", "updatedAt") FROM stdin;
cmm98hh8a00078oesnp2iou4d	Shopping Bag	{"SHOPPING BAG","Oxo Bio Shopping Bag","PLAST SHOPPING BAG"}	ai	2026-03-02 13:47:49.498	2026-03-02 13:47:49.498
cmm98hh9d000l8oesekeylly2	Fish	{"NOR SALMON FILLET","SALMON FILLET"}	manual	2026-03-02 13:47:49.537	2026-03-02 15:04:45.196
cmm98hh8k000a8oesi2ee969o	Eggs	{"Al Jazira Eggs White Family Pack","Eggs New","Eggs Pass","Eggs Big"}	manual	2026-03-02 13:47:49.508	2026-03-02 15:11:58.263
\.


--
-- Data for Name: meal_plans; Type: TABLE DATA; Schema: public; Owner: revenue
--

COPY public.meal_plans (id, "weekLabel", plan, "createdAt") FROM stdin;
cmm9ptfup00008oi6pv8cihtm	۱۲ اسفند — هفته	{"days": [{"day": "شنبه", "meals": {"lunch": {"name": "سیب‌زمینی سرخ‌کرده با سالاد", "recipe": "مواد لازم:\\n- ۲ عدد سیب‌زمینی\\n- ۱ عدد پیاز رد\\n- خیاری تازه (به دلخواه)\\n- روغن زیتون و نمک\\n\\nمراحل:\\n۱. سیب‌زمینی‌ها را پوست بکنید و به شکل خلالی برش بزنید.\\n۲. آنها را در روغن داغ سرخ کنید تا طلایی شوند.\\n۳. پیاز را خرد کرده و در باقیمانده روغن تفت دهید.\\n۴. سالاد را با خیار و پیاز سرو کنید."}, "dinner": {"name": "ماهی کبابی با سیب‌زمینی", "recipe": "مواد لازم:\\n- ۲ عدد ماهی سالمون\\n- ۱ عدد سیب‌زمینی\\n- ۱ قاشق غذاخوری روغن زیتون\\n- نمک و فلفل\\n\\nمراحل:\\n۱. ماهی‌ها را با روغن، نمک و فلفل مزه‌دار کنید.\\n۲. سیب‌زمینی‌ها را بپزید و سپس به قطعات کوچک برش بزنید.\\n۳. ماهی‌ها را روی حرارت ملایم کباب کنید."}, "breakfast": {"name": "املت با گوجه فرنگی", "recipe": "مواد لازم:\\n- ۲ عدد تخم مرغ\\n- ۱ عدد گوجه فرنگی\\n- ۱ قاشق غذاخوری روغن زیتون\\n- نمک و فلفل به میزان لازم\\n\\nمراحل:\\n۱. تخم مرغ‌ها را در کاسه‌ای بشکنید و با نمک و فلفل خوب مخلوط کنید.\\n۲. روغن زیتون را در تابه گرم کنید.\\n۳. گوجه فرنگی را خرد کرده و در تابه بگذارید و کمی تفت دهید.\\n۴. مخلوط تخم مرغ را به تابه اضافه کنید و بگذارید بپزد تا طلایی شود."}}}, {"day": "یک‌شنبه", "meals": {"lunch": {"name": "پاستا با سبزیجات", "recipe": "مواد لازم:\\n- ۱۵۰ گرم پاستا\\n- ۱ عدد فلفل دلمه‌ای\\n- ۱ قاشق روغن زیتون\\n- نمک و فلفل به میزان لازم\\n\\nمراحل:\\n۱. پاستا را در آب نمک‌دار بجوشانید تا نرم شود.\\n۲. فلفل دلمه‌ای را خرد کرده و با روغن تفت دهید.\\n۳. پاستا را به مخلوط اضافه کرده و روی حرارت بگذارید."}, "dinner": {"name": "سیب‌زمینی شکم‌پر", "recipe": "مواد لازم:\\n- ۲ عدد سیب‌زمینی بزرگ\\n- ۱ عدد پیاز\\n- ۱ عدد تخم مرغ\\n- روغن زیتون\\n\\nمراحل:\\n۱. سیب‌زمینی‌ها را پخته و وسط آنها را خالی کنید.\\n۲. پیاز را تفت داده و با تخم مرغ مخلوط کنید.\\n۳. مخلوط را داخل سیب‌زمینی‌ها ریخته و در فر بپزید."}, "breakfast": {"name": "نان و پنیر و سبزی", "recipe": "مواد لازم:\\n- نان\\n- پنیر\\n- سبزی تازه (به دلخواه)\\n\\nمراحل:\\n۱. نان را برش بزنید.\\n۲. پنیر را روی نان بگذارید.\\n۳. سبزی را به همراه نان و پنیر سرو کنید."}}}, {"day": "دوشنبه", "meals": {"lunch": {"name": "خوراک قارچ", "recipe": "مواد لازم:\\n- ۲۰۰ گرم قارچ\\n- ۱ عدد پیاز\\n- روغن زیتون\\n\\nمراحل:\\n۱. پیاز را خرد کرده و در روغن تفت دهید.\\n۲. قارچ‌ها را اضافه کرده و بپزید تا نرم شوند."}, "dinner": {"name": "کباب ماهی با ترشی", "recipe": "مواد لازم:\\n- ۲ عدد ماهی سالمون\\n- ترشی به دلخواه\\n\\nمراحل:\\n۱. ماهی‌ها را روی جگر کباب کنید.\\n۲. کباب را با ترشی سرو کنید."}, "breakfast": {"name": "کیک تخم‌مرغی", "recipe": "مواد لازم:\\n- ۳ عدد تخم‌مرغ\\n- ۱ قاشق روغن زیتون\\n- ۱ قاشق نمک\\n\\nمراحل:\\n۱. تخم‌مرغ‌ها را در دیگ بزنید و نمک را به آن اضافه کنید.\\n۲. روغن را در تابه گرم کنید و مخلوط را داخل آن بریزید.\\n۳. بگذارید تا پخته شود."}}}, {"day": "سه‌شنبه", "meals": {"lunch": {"name": "خوراک سیب‌زمینی و کدو", "recipe": "مواد لازم:\\n- ۲ عدد سیب‌زمینی\\n- ۱ عدد کدو\\n- روغن زیتون\\n\\nمراحل:\\n۱. سیب‌زمینی و کدو را خرد کنید.\\n۲. در تابه‌ای با روغن زیتون سرخ کنید."}, "dinner": {"name": "سالاد میوه", "recipe": "مواد لازم:\\n- میوه‌های مختلف (مثل سیب، گلابی و کیوی)\\n- ماست به دلخواه\\n\\nمراحل:\\n۱. میوه‌ها را خرد کرده و در کاسه‌ای بریزید.\\n۲. ماست را به آن اضافه و مخلوط کنید."}, "breakfast": {"name": "نوشیدنی میوه‌ای", "recipe": "مواد لازم:\\n- ۱ عدد موز\\n- ۱ عدد کیوی\\n- ۱ قاشق عسل (به دلخواه)\\n\\nمراحل:\\n۱. موز و کیوی را در مخلوط کن ریخته و مخلوط کنید.\\n۲. مقداری عسل را اضافه کرده و دوباره مخلوط کنید."}}}, {"day": "چهارشنبه", "meals": {"lunch": {"name": "پاستا با سس گوجه‌فرنگی", "recipe": "مواد لازم:\\n- ۱۰۰ گرم پاستا\\n- ۱ عدد گوجه‌فرنگی\\n- ۱ قاشق روغن زیتون\\n\\nمراحل:\\n۱. پاستا را بپزید.\\n۲. گوجه‌فرنگی را ریز خرد کنید و با روغن تفت دهید."}, "dinner": {"name": "گوشت ماهی سرخ‌کرده", "recipe": "مواد لازم:\\n- ۲ عدد ماهی سالمون\\n- روغن زیتون\\n\\nمراحل:\\n۱. ماهی‌ها را در روغن سرخ کنید تا طلایی شوند."}, "breakfast": {"name": "تخم‌مرغ آب‌پز", "recipe": "مواد لازم:\\n- ۲ عدد تخم‌مرغ\\n\\nمراحل:\\n۱. تخم‌مرغ‌ها را در آب جوش بپزید تا آب‌پز شوند."}}}, {"day": "پنج‌شنبه", "meals": {"lunch": {"name": "خوراک کدو", "recipe": "مواد لازم:\\n- ۲ عدد کدو\\n- ۱ عدد پیاز\\n- روغن زیتون\\n\\nمراحل:\\n۱. پیاز را تفت دهید.\\n۲. کدوها را اضافه کرده و بپزید."}, "dinner": {"name": "ماهی با سس گوجه‌فرنگی", "recipe": "مواد لازم:\\n- ۲ عدد ماهی\\n- ۱ عدد گوجه‌فرنگی\\n\\nمراحل:\\n۱. گوجه‌فرنگی را ریز خرد کنید و روی ماهی‌ها بریزید و سپس بپزید."}, "breakfast": {"name": " ماست با میوه", "recipe": "مواد لازم:\\n- ۱ فنجان ماست\\n- میوه‌های خرد‌شده (به دلخواه)\\n\\nمراحل:\\n۱. ماست را در کاسه بریزید و میوه‌ها را اضافه کنید."}}}, {"day": "جمعه", "meals": {"lunch": {"name": "خوراک فلفل دلمه‌ای", "recipe": "مواد لازم:\\n- ۲ عدد فلفل دلمه‌ای\\n- ۱ عدد پیاز\\n\\nمراحل:\\n۱. پیاز را خرد کرده و تفت دهید.\\n۲. فلفل دلمه‌ای‌ها را اضافه کنید و بپزید."}, "dinner": {"name": "سالاد ماکارونی", "recipe": "مواد لازم:\\n- ۱ فنجان ماکارونی\\n- سس گوجه‌فرنگی\\n\\nمراحل:\\n۱. ماکارونی را بپزید.\\n۲. با سس ترکیب کنید و سرو کنید."}, "breakfast": {"name": "کیک میوه", "recipe": "مواد لازم:\\n- ۱ عدد میوه (به دلخواه)\\n- ۱ فنجان آرد\\n- ۱ قاشق روغن زیتون\\n\\nمراحل:\\n۱. میوه را خرد کنید و با آرد و روغن مخلوط کنید.\\n۲. در فر بپزید."}}}], "shoppingList": ["پنیر", "سبزی تازه", "گوشت"]}	2026-03-02 21:53:01.056
cmm9q0kjy00018oi6syy5ha9b	۱۲ اسفند — هفته	{"days": [{"day": "شنبه", "meals": {"lunch": {"name": "سالاد فصل با ماست و خیار", "recipe": "مواد لازم:\\n- ۱ پیمانه سالاد سبز (کاهو، خیار، و گوجه‌فرنگی) \\n- ۱/۲ پیمانه ماست کم‌چرب \\n- ۱ قاشق غذاخوری روغن زیتون \\n- نمک و فلفل به میزان لازم\\n\\n1. سبزیجات را به تکه‌های کوچک خرد کنید. \\n2. در یک کاسه، سبزیجات، ماست و روغن زیتون را مخلوط کنید. \\n3. نمک و فلفل را اضافه کنید و هم بزنید. \\n4. سرو کنید.", "ingredients": ["سالاد سبز ۱ پیمانه", "ماست کم‌چرب ۱/۲ پیمانه", "روغن زیتون ۱ قاشق غذاخوری"], "hasIngredients": true}, "dinner": {"name": "فیله سالمون کبابی", "recipe": "مواد لازم:\\n- ۱ عدد فیله سالمون \\n- ۱ قاشق غذاخوری روغن زیتون \\n- نمک و فلفل به میزان لازم\\n\\n1. فیله سالمون را با روغن زیتون و نمک و فلفل مزه‌دار کنید. \\n2. روی کباب‌پز یا تابه سرخ کنید تا هر طرف ۵-۷ دقیقه سرخ شود. \\n3. با سبزیجات بخارپز سرو کنید.", "ingredients": ["فیله سالمون ۱ عدد", "روغن زیتون ۱ قاشق غذاخوری"], "hasIngredients": false}, "breakfast": {"name": "املت سبزیجات", "recipe": "مواد لازم: \\n- 3 عدد سفیده تخم‌مرغ \\n- 1 عدد فلفل دلمه‌ای (خرد شده) \\n- 1 عدد پیاز کوچک (خرد شده) \\n- 1 قاشق غذاخوری روغن زیتون \\n- نمک و فلفل به میزان لازم\\n\\n1. در یک تابه نچسب، روغن زیتون را گرم کنید. \\n2. پیاز و فلفل دلمه‌ای را اضافه کرده و سرخ کنید تا نرم شوند. \\n3. سفیده‌های تخم‌مرغ را به تابه اضافه کنید و به آرامی هم بزنید تا بپزد. \\n4. با نمک و فلفل چاشنی بزنید و سرو کنید.", "ingredients": ["سفیده تخم‌مرغ ۳ عدد", "فلفل دلمه‌ای ۱ عدد", "پیاز کوچک ۱ عدد", "روغن زیتون ۱ قاشق غذاخوری"], "hasIngredients": true}}}, {"day": "یکشنبه", "meals": {"lunch": {"name": "خوراک کدو و بادمجان", "recipe": "مواد لازم:\\n- ۱ عدد بادمجان (خرد شده) \\n- ۱ عدد کدو (خرد شده) \\n- ۱ عدد پیاز (خرد شده) \\n- ۱ قاشق غذاخوری روغن زیتون \\n- نمک و فلفل به میزان لازم\\n\\n1. در یک تابه، روغن زیتون را گرم کرده و پیاز را سرخ کنید. \\n2. بادمجان و کدو را اضافه کرده و چند دقیقه دیگر سرخ کنید. \\n3. با نمک و فلفل چاشنی بزنید و سرو کنید.", "ingredients": ["بادمجان ۱ عدد", "کدو ۱ عدد", "پیاز ۱ عدد", "روغن زیتون ۱ قاشق غذاخوری"], "hasIngredients": true}, "dinner": {"name": "کوکوی سیب‌زمینی", "recipe": "مواد لازم:\\n- ۲ عدد سیب‌زمینی (پوست کنده و رنده شده) \\n- ۲ عدد سفیده تخم‌مرغ \\n- نمک و فلفل به میزان لازم \\n- ۱ قاشق غذاخوری روغن زیتون\\n\\n1. سیب‌زمینی رنده شده را با سفیده‌های تخم‌مرغ و نمک و فلفل مخلوط کنید. \\n2. در تابه، روغن را گرم کنید و مخلوط را در آن بریزید. \\n3. هر طرف ۳-۴ دقیقه سرخ کنید تا طلایی شود.", "ingredients": ["سیب‌زمینی ۲ عدد", "سفیده تخم‌مرغ ۲ عدد", "روغن زیتون ۱ قاشق غذاخوری"], "hasIngredients": false}, "breakfast": {"name": "موز و ماست", "recipe": "مواد لازم: \\n- ۱ عدد موز \\n- ۱ پیمانه ماست کم‌چرب \\n\\n1. موز را برش زده و در یک کاسه قرار دهید. \\n2. ماست را روی موز بریزید و سرو کنید.", "ingredients": ["موز ۱ عدد", "ماست کم‌چرب ۱ پیمانه"], "hasIngredients": true}}}, {"day": "دوشنبه", "meals": {"lunch": {"name": "خوراک لوبیا چشم بلبلی", "recipe": "مواد لازم:\\n- ۱ پیمانه لوبیا چشم بلبلی (پخته شده) \\n- ۱ عدد پیاز (خرد شده) \\n- ۱ قاشق غذاخوری روغن زیتون \\n- نمک و فلفل به میزان لازم\\n\\n1. پیاز را در روغن زیتون سرخ کنید. \\n2. لوبیا پخته شده را اضافه کرده و چند دقیقه تفت دهید. \\n3. با نمک و فلفل سرو کنید.", "ingredients": ["لوبیا چشم بلبلی ۱ پیمانه", "پیاز ۱ عدد", "روغن زیتون ۱ قاشق غذاخوری"], "hasIngredients": false}, "dinner": {"name": "خورش سبزی", "recipe": "مواد لازم:\\n- ۱ پیمانه سبزی خورشتی (پخته شده) \\n- ۱ عدد پیاز (خرد شده) \\n- ۱ قاشق غذاخوری روغن زیتون \\n- نمک و فلفل به میزان لازم\\n\\n1. پیاز را در روغن زیتون سرخ کنید. \\n2. سبزی پخته شده را اضافه کنید و به مدت ۱۰ دقیقه بپزید.", "ingredients": ["سبزی خورشتی ۱ پیمانه", "پیاز ۱ عدد", "روغن زیتون ۱ قاشق غذاخوری"], "hasIngredients": false}, "breakfast": {"name": "اسموتی میوه", "recipe": "مواد لازم: \\n- ۱ موز \\n- ۱ پرتقال (پوست کنده) \\n- ۱/۲ پیمانه ماست کم‌چرب \\n\\n1. همه مواد را در مخلوط‌کن ریخته و خوب مخلوط کنید. \\n2. در لیوان سرو کنید.", "ingredients": ["موز ۱ عدد", "پرتقال ۱ عدد", "ماست کم‌چرب ۱/۲ پیمانه"], "hasIngredients": false}}}, {"day": "سه‌شنبه", "meals": {"lunch": {"name": "سالاد ماکارونی با سبزیجات", "recipe": "مواد لازم:\\n- ۱ پیمانه ماکارونی پخته \\n- ۱/۲ پیمانه فلفل دلمه‌ای (خرد شده) \\n- ۱/۴ پیمانه روغن زیتون \\n- نمک و فلفل به میزان لازم\\n\\n1. ماکارونی پخته را با سبزیجات و روغن مخلوط کنید. \\n2. با نمک و فلفل طعم‌دار کنید.", "ingredients": ["ماکارونی ۱ پیمانه", "فلفل دلمه‌ای ۱/۲ پیمانه", "روغن زیتون ۱/۴ پیمانه"], "hasIngredients": false}, "dinner": {"name": "کیک سبزیجتی", "recipe": "مواد لازم:\\n- ۱ پیمانه سبزیجات (رنده شده) \\n- ۳ عدد تخم‌مرغ \\n- ۱ هزار قاشق غذاخوری روغن کم‌چرب\\n\\n1. همه مواد را مخلوط کنید. \\n2. در قالب کیک بریزید و در فر بپزید.", "ingredients": ["سبزیجات ۱ پیمانه", "تخم‌مرغ ۳ عدد", "روغن کم‌چرب ۱ قاشق غذاخوری"], "hasIngredients": false}, "breakfast": {"name": "پنکیک آرد جو", "recipe": "مواد لازم: \\n- ۱ پیمانه آرد جو \\n- ۱ عدد سفیده تخم‌مرغ \\n- ۱ پیمانه شیر کم‌چرب \\n\\n1. همه مواد را مخلوط کنید تا خمیری یکدست حاصل شود. \\n2. در تابه غیرچسبنده، کم‌کم مواد را بریزید و از دو طرف سرخ کنید.", "ingredients": ["آرد جو ۱ پیمانه", "سفیده تخم‌مرغ ۱ عدد", "شیر کم‌چرب ۱ پیمانه"], "hasIngredients": false}}}, {"day": "چهارشنبه", "meals": {"lunch": {"name": "پلو با سبزیجات", "recipe": "مواد لازم:\\n- ۱ پیمانه برنج (پخته) \\n- ۱/۲ پیمانه سبزیجات (بخاری) \\n\\n1. برنج را بپزید و سبزیجات را به آن اضافه کنید. \\n2. چاشنی‌های دلخواه را اضافه کنید.", "ingredients": ["برنج ۱ پیمانه", "سبزیجات بخارپز ۱/۲ پیمانه"], "hasIngredients": false}, "dinner": {"name": "ته‌چین سبزی", "recipe": "مواد لازم:\\n- ۲ پیمانه برنج پخته \\n- ۱ پیمانه ماست کم‌چرب \\n- ۱/۲ پیمانه سبزیجات \\n\\n1. همه مواد را مخلوط کرده، در ظرف مناسب بریزید. \\n2. در فر پخته و طلایی شود.", "ingredients": ["برنج پخته ۲ پیمانه", "ماست کم‌چرب ۱ پیمانه", "سبزیجات ۱/۲ پیمانه"], "hasIngredients": false}, "breakfast": {"name": "موز و عسل", "recipe": "مواد لازم: \\n- ۱ موز \\n- ۱ قاشق غذاخوری عسل\\n\\n1. موز را برش بزنید. \\n2. عسل را روی موز بریزید و سرو کنید.", "ingredients": ["موز ۱ عدد", "عسل ۱ قاشق غذاخوری"], "hasIngredients": false}}}, {"day": "پنج‌شنبه", "meals": {"lunch": {"name": "خوراک هویج و سیب‌زمینی", "recipe": "مواد لازم:\\n- ۱ عدد هویج (خرد شده) \\n- ۱ عدد سیب‌زمینی (خرد شده) \\n- ۱ قاشق غذاخوری روغن زیتون \\n\\n1. هویج و سیب‌زمینی را با روغن زیتون سرخ کنید. \\n2. با نمک و فلفل سرو کنید.", "ingredients": ["هویج ۱ عدد", "سیب‌زمینی ۱ عدد", "روغن زیتون ۱ قاشق غذاخوری"], "hasIngredients": false}, "dinner": {"name": "خورش قرمز با سبزیجات", "recipe": "مواد لازم:\\n- ۱ پیمانه گوشت قیمه‌ای \\n- ۱ عدد پیاز (خرد شده) \\n- ۲ پیمانه سبزیجات به دلخواه\\n\\n1. پیاز را سرخ کرده، گوشت را اضافه کنید. \\n2. سبزیجات را اضافه کرده و بپزید.", "ingredients": ["گوشت قیمه‌ای ۱ پیمانه", "پیاز ۱ عدد", "سبزیجات به دلخواه ۲ پیمانه"], "hasIngredients": false}, "breakfast": {"name": "ژله میوه‌ای", "recipe": "مواد لازم:\\n- ۱ پیمانه آب \\n- ۱ بسته پودر ژله میوه‌ای \\n\\n1. آب را جوش کنید و پودر ژله را در آن حل کنید. \\n2. در یخچال بگذارید تا بسته شود.", "ingredients": ["آب ۱ پیمانه", "پودر ژله میوه‌ای ۱ بسته"], "hasIngredients": false}}}, {"day": "جمعه", "meals": {"lunch": {"name": "خورش سبزیجات و لوبیا", "recipe": "مواد لازم:\\n- ۱ پیمانه لوبیا پخته \\n- ۲ پیمانه سبزیجات (بخارپز شده) \\n- ۱ قاشق غذاخوری روغن زیتون \\n\\n1. لوبیا و سبزیجات را در تابه با روغن زیتون گرم کنید. \\n2. با نمک و فلفل طعم‌دار کنید.", "ingredients": ["لوبیا پخته ۱ پیمانه", "سبزیجات بخارپز ۲ پیمانه", "روغن زیتون ۱ قاشق غذاخوری"], "hasIngredients": false}, "dinner": {"name": "پلو با خورشت سبزیجات", "recipe": "مواد لازم:\\n- ۱/۲ پیمانه برنج پخته \\n- ۱ پیمانه خورشت سبزیجات\\n\\n1. برنج را در دیس بکشید و خورشت سبزیجات را روی آن بریزید. \\n2. سرو کنید.", "ingredients": ["برنج پخته ۱/۲ پیمانه", "خورشت سبزیجات ۱ پیمانه"], "hasIngredients": false}, "breakfast": {"name": "اسموتی سبز", "recipe": "مواد لازم:\\n- ۱/۲ پیمانه کدو سبز (خرد شده) \\n- ۱/۲ موز \\n- ۱ پیمانه ماست کم‌چرب \\n\\n1. همه مواد را در مخلوط‌کن بریزید و خوب مخلوط کنید. \\n2. در لیوان سرو کنید.", "ingredients": ["کدو سبز ۱/۲ پیمانه", "موز ۱/۲ عدد", "ماست کم‌چرب ۱ پیمانه"], "hasIngredients": false}}}], "shoppingList": ["پودر ژله میوه‌ای", "پرتقال", "آب", "سیب‌زمینی", "خورشت سبزیجات", "هویج", "گوشت قیمه‌ای", "سبزیجات تازه", "ماکارونی", "پنیر کم‌چرب"]}	2026-03-02 21:58:33.741
cmmafx5z40002p5vk2e2jmifa	۱۲ اسفند — هفته	{"days": [{"day": "شنبه", "meals": {"lunch": {"name": "سالاد چغندر و کدو 🍅", "recipe": "سالاد خوشمزه و مغذی با چغندر و کدو که می‌تواند برای ناهار عالی باشد.", "ingredients": ["200 گرم چغندر پخته", "50 گرم کدو رنده شده", "1 قاشق غذاخوری روغن زیتون", "نمک و فلفل به میزان لازم"], "hasIngredients": true}, "dinner": {"name": "سلامن گریل شده با سبزیجات 🐟", "recipe": "سالمن را با ادویه‌های ایرانی گریل کنید و با سبزیجات تازه سرو کنید.", "ingredients": ["200 گرم فایل سالمن", "1 قاشق غذاخوری روغن زیتون", "مقداری سبزیجات بخارپز"], "hasIngredients": false}, "breakfast": {"name": "املت سفیدی با گوجه 🍳", "recipe": "این صبحانه سالم و خوشمزه با طعم گوجه و ادویه تهیه می‌شود.", "ingredients": ["4 عدد سفیده تخم‌مرغ", "1 عدد گوجه‌فرنگی ریز خرد شده", "نمک و فلفل به میزان لازم"], "hasIngredients": true}}}, {"day": "یکشنبه", "meals": {"lunch": {"name": "خوراک سیب‌زمینی و سالمن با بروکلی 🥦", "recipe": "این خوراک خوشمزه و سبک با سیب‌زمینی و بروکلی آماده می‌شود.", "ingredients": ["1 عدد سیب‌زمینی پخته", "100 گرم سالمن سرخ شده", "50 گرم بروکلی بخارپز"], "hasIngredients": false}, "dinner": {"name": "سالاد ماست و نعناع 🥗", "recipe": "سالاد آسان و خوشمزه با ماست و نعناع به راحتی درست می‌شود.", "ingredients": ["200 گرم ماست", "2 قاشق غذاخوری نعناع خشک و تازه", "نمک و فلفل به میزان لازم"], "hasIngredients": false}, "breakfast": {"name": "اسموتی میوه‌ای کیوی و موز 🍌", "recipe": "این اسموتی خوشمزه را با کیوی و موز درست کنید.", "ingredients": ["1 عدد موز", "1 عدد کیوی", "200 میلی‌لیتر دوغ"], "hasIngredients": true}}}, {"day": "دوشنبه", "meals": {"lunch": {"name": "خوراک سفیده تخم‌مرغ با کدو سبز و گوجه 🍳", "recipe": "این خوراک خوشمزه و سرشار از پروتئین با کدو و گوجه تهیه می‌شود.", "ingredients": ["4 عدد سفیده تخم‌مرغ", "1 عدد کدو سبز", "1 عدد گوجه‌فرنگی ریز خرد شده", "نمک و فلفل به میزان لازم"], "hasIngredients": true}, "dinner": {"name": "ماهی پخته شده با لیمو و سبزیجات 🍋", "recipe": "ماهی را با لیمو و سبزیجات تازه بپزید.", "ingredients": ["200 گرم سالمن", "1 عدد لیمو", "مقداری سبزیجات تازه"], "hasIngredients": false}, "breakfast": {"name": "چغندر پخته و ماست 🍽", "recipe": "چغندر را با ماست مخلوط کنید و برای صبحانه بخورید.", "ingredients": ["100 گرم چغندر پخته", "200 گرم ماست"], "hasIngredients": true}}}, {"day": "سه‌شنبه", "meals": {"lunch": {"name": "نان و ماست با خیار 🥒", "recipe": "نان و ماست را با خیار رنده شده میل کنید. مثل گوشت نیز می‌توانید آن را بگذارید.", "ingredients": ["1 عدد نان", "200 گرم ماست", "1 عدد خیار"], "hasIngredients": false}, "dinner": {"name": "خوراک سبزیجات بخارپز با روغن زیتون 🥦", "recipe": "تمام سبزیجات خود را بخارپز کرده و با روغن زیتون سرو کنید.", "ingredients": ["مقداری سبزیجات مختلف", "1 قاشق غذاخوری روغن زیتون"], "hasIngredients": false}, "breakfast": {"name": "سالاد میوه با توت‌فرنگی و کیوی 🍓", "recipe": "میوه‌های تازه را با هم مخلوط کنید و برای صبحانه سرو کنید.", "ingredients": ["1 عدد کیوی", "100 گرم توت‌فرنگی", "1 قاشق غذاخوری ماست"], "hasIngredients": false}}}, {"day": "چهارشنبه", "meals": {"lunch": {"name": "انار و کدو سالاد 🥗", "recipe": "سالادی سالم و خوشمزه با انار و کدو درست کنید.", "ingredients": ["1 عدد کدو خرد شده", "100 گرم دانه انار", "1 قاشق غذاخوری روغن زیتون"], "hasIngredients": false}, "dinner": {"name": "ماهی کبابی با لیمو و سبزیجات 🍋", "recipe": "ماهی را با لیمو و سبزیجات کباب کنید.", "ingredients": ["200 گرم فایل سالمن", "1 عدد لیمو", "مقداری سبزیجات"], "hasIngredients": false}, "breakfast": {"name": "املت با نعناع و پیاز 🍳", "recipe": "املت را با نعناع و پیاز درست کنید.", "ingredients": ["3 عدد سفیده تخم‌مرغ", "1 عدد پیاز", "1 قاشق نعناع خشک", "نمک و فلفل به میزان لازم"], "hasIngredients": true}}}, {"day": "پنجشنبه", "meals": {"lunch": {"name": "خوراک کدو و سیب‌زمینی 🥔", "recipe": "کدو و سیب‌زمینی را بخارپز کنید و سرو کنید.", "ingredients": ["1 عدد کدو", "1 عدد سیب‌زمینی", "نمک و فلفل به میزان لازم"], "hasIngredients": false}, "dinner": {"name": "سالاد فصل با ماست 🥗", "recipe": "سالاد با سبزیجات تازه و ماست درست کنید.", "ingredients": ["مقداری سبزیجات تازه", "200 گرم ماست", "نمک و فلفل به میزان لازم"], "hasIngredients": false}, "breakfast": {"name": "شیرینی سفیده تخم‌مرغ با میوه 🍮", "recipe": "شیرینی سنتی که با سفیده تخم‌مرغ و میوه تهیه می‌شود.", "ingredients": ["4 عدد سفیده تخم‌مرغ", "100 گرم شکر قند", "مقداری میوه تازه"], "hasIngredients": false}}}, {"day": "جمعه", "meals": {"lunch": {"name": "خوراک کدو با خرمالو 🥗", "recipe": "این خوراک خوشمزه و مفید با کدو و خرمالو تهیه می‌شود.", "ingredients": ["1 عدد کدو", "1 عدد خرمالو", "مقداری ادویه دلخواه"], "hasIngredients": false}, "dinner": {"name": "سالاد کدو و چغندر با پنیر 🥗", "recipe": "سالادی خوشمزه با چغندر و کدو با پنیر رنده شده.", "ingredients": ["100 گرم چغندر", "50 گرم کدو", "50 گرم پنیر"], "hasIngredients": false}, "breakfast": {"name": "کوکو سیب‌زمینی با کپکی 🥘", "recipe": "سیب‌زمینی را با کپکی درست کنید و سرخ نکنید.", "ingredients": ["2 عدد سیب‌زمینی", "1 عدد پیاز", "30 گرم کپکی"], "hasIngredients": false}}}], "shoppingList": ["200 گرم سالمن", "200 گرم ماست", "4 عدد کدو", "250 گرم توت‌فرنگی", "1 عدد سیب‌زمینی", "100 گرم خرمالو", "کمی پنیر"]}	2026-03-03 10:03:44.895
\.


--
-- Data for Name: merchant_category_rules; Type: TABLE DATA; Schema: public; Owner: revenue
--

COPY public.merchant_category_rules (id, pattern, "categoryId", "createdAt") FROM stdin;
\.


--
-- Data for Name: money_advices; Type: TABLE DATA; Schema: public; Owner: revenue
--

COPY public.money_advices (id, summary, "emergencyFundNeeded", "emergencyFundCurrent", "investableAmount", suggestions, "createdAt") FROM stdin;
cmm9nv7rv00008otvol4103of	The user has significant reserves totaling 90,114 AED, with a strong net cash flow of 18,652 AED per month. Strategic investment of these reserves can generate additional income while maintaining an adequate emergency fund.	20862	459	69292	[{"risk": "low", "title": "High-Interest Savings Account", "description": "Consider transferring cash reserves totaling 32,672 AED from M Bank Sina, M Bank Farnoosh, Blu Bank, and Binance to a high-interest savings account offering around 3% annual interest. This can yield approximately 82 AED monthly and 984 AED yearly.", "relatedReserve": "M Bank Sina, M Bank Farnoosh, Blu Bank, Binance", "potentialYearly": 984, "potentialMonthly": 82}, {"risk": "high", "title": "Crypto Yield Farming", "description": "Utilize 20,712 AED from USDC in your Trust Wallet to engage in yield farming, which could provide approximately 8% annual returns. This could potentially yield about 138 AED monthly and 1,652 AED yearly.", "relatedReserve": "USDC Cryprto Trust Wallet", "potentialYearly": 1652, "potentialMonthly": 138}, {"risk": "medium", "title": "Invest in UAE Bonds or Funds", "description": "Allocate 20,000 AED from the total reserves into UAE government bonds or mutual funds with an average return of 5% annually. This would yield around 83 AED monthly and 1,000 AED yearly.", "relatedReserve": "null", "potentialYearly": 1000, "potentialMonthly": 83}, {"risk": "medium", "title": "Diversification into Gold", "description": "Consider investing 10,000 AED into gold through local dealers or ETFs, which has historically provided stable returns. Expectations can be around 7% annually, yielding about 58 AED monthly and 700 AED yearly.", "relatedReserve": "null", "potentialYearly": 700, "potentialMonthly": 58}, {"risk": "high", "title": "Expand Crypto Holdings", "description": "With excess reserves, diversify your crypto investment beyond USDC with 5,000 AED into various potential altcoins, with expected average returns of 15% yearly. This could yield around 62 AED monthly and 740 AED yearly.", "relatedReserve": "null", "potentialYearly": 740, "potentialMonthly": 62}]	2026-03-02 20:58:24.667
cmm9nwqx300018otvi2mapfwz	You have a monthly net cash flow of 18652 AED with total reserves of 90114 AED. After accounting for an emergency fund, there are significant investment opportunities available.	2083	0	88031	[{"risk": "low", "title": "High-Interest Savings Account", "description": "Consider placing the cash reserves (like M Bank Sina, Blu Bank Cash, and part of Mashreq Bank reserves totaling around 6060 AED) into a high-interest savings account yielding 1.5% annually. This could generate roughly 75 AED monthly.", "relatedReserve": "M Bank Sina", "potentialYearly": 900, "potentialMonthly": 75}, {"risk": "high", "title": "Crypto Staking", "description": "Utilize your USDC holdings (20712 AED) for staking on platforms offering yields, averaging around 10% annually. This could yield approximately 1726 AED yearly, or about 144 AED monthly.", "relatedReserve": "USDC Cryprto Trust Wallet", "potentialYearly": 1728, "potentialMonthly": 144}, {"risk": "medium", "title": "Invest in Bonds or ETFs", "description": "With 50000 AED from Mashreq Bank reserves, consider investing in a diversified bond or ETF fund that could return about 5% per year, yielding approximately 2083 AED yearly or around 174 AED monthly.", "relatedReserve": "Mashreq Bank Company", "potentialYearly": 2083, "potentialMonthly": 174}, {"risk": "medium", "title": "Diversify into Gold", "description": "Maintain about 10000 AED in gold as a hedge against inflation and currency devaluation, which can appreciate over time. While not directly yielding income, this could preserve and grow value long-term.", "relatedReserve": "null", "potentialYearly": null, "potentialMonthly": null}]	2026-03-02 20:59:36.136
cmmafurt00000p5vkozxc9mec	You have a strong monthly cash flow of 18,521 AED and total reserves of 90,114 AED, presenting you with opportunities to generate additional income.	2088	0	87996	[{"risk": "low", "title": "🏦 High-Interest Savings", "description": "Move 30,000 AED from your various cash reserves into a high-interest savings account offering 3% annual interest. This would yield approximately 750 AED annually.", "relatedReserve": "M Bank Sina, M Bank Farnoosh, Blu Bank Cash", "potentialYearly": 750, "potentialMonthly": 62.5}, {"risk": "high", "title": "📈 Crypto Staking", "description": "Utilize your USDC in the Crypto Trust Wallet, estimated at 20,712 AED, to stake with an average annual return of 8%. This could yield around 1,657 AED annually for you.", "relatedReserve": "USDC Cryprto Trust Wallet", "potentialYearly": 1657, "potentialMonthly": 138.08}, {"risk": "medium", "title": "💰 Invest in Local Bonds", "description": "Consider investing 50,000 AED in local government bonds with an average yield of 5% per year, generating about 2,500 AED annually.", "relatedReserve": "Mashreq Bank Company", "potentialYearly": 2500, "potentialMonthly": 208.33}, {"risk": "medium", "title": "🔒 Diversify Gold Reserves", "description": "If you have any gold reserves or are interested, invest about 10% of your total reserves (around 9,000 AED) in physical gold or gold ETFs, potentially averaging 6% returns annually, leading to about 540 AED.", "relatedReserve": "null", "potentialYearly": 540, "potentialMonthly": 45}, {"risk": "high", "title": "📈 ETFs/Stocks", "description": "Use 20,000 AED to invest in diversified ETFs, which may provide around 7% annual returns, totaling approximately 1,400 AED yearly.", "relatedReserve": "null", "potentialYearly": 1400, "potentialMonthly": 116.67}]	2026-03-03 10:01:53.22
cmmb36y3b00008oi02yt9mbqm	You have a solid monthly surplus of 18521 AED, but a significant amount in reserves that can be put to work for additional income generation. Your emergency fund should be around 2085 AED, leaving you with 88029 AED for investments.	2085	0	88029	[{"risk": "low", "title": "🏦 High-Interest Savings Account", "description": "Consider placing your cash reserves like 459 AED + 360 AED + 7712 AED + 92 AED + 560 AED + 4997 AED + 5000 AED + 43000 AED in a high-interest savings account offering around 2% annual return. This could yield a monthly return of approximately 146.80 AED or 1761.60 AED yearly.", "relatedReserve": "cash", "potentialYearly": 1761.6, "potentialMonthly": 146.8}, {"risk": "medium", "title": "📈 Crypto Yield Staking", "description": "Utilizing the 20712 AED in USDC can be staked for a potential yield of around 8% annually in platforms that offer this service. This could result in a monthly return of about 138.08 AED or 1656.96 AED annually, which adds a good yield as part of a balanced approach to risk.", "relatedReserve": "USDC Cryprto Trust Wallet", "potentialYearly": 1656.96, "potentialMonthly": 138.08}, {"risk": "medium", "title": "🔒 Short-Term Bonds", "description": "Consider investing in short-term bonds with your cash reserves (like the 4997 AED in Mashreq Bank Sina and 5000 AED in Mashreq Bank Farnoosh). These can yield around 4% annually, providing potentially 16.66 AED monthly or 199.96 AED yearly.", "relatedReserve": "Mashreq Bank Sina", "potentialYearly": 199.96, "potentialMonthly": 16.66}, {"risk": "low", "title": "💰 Emergency Fund Setup", "description": "Since your emergency fund needs are relatively low, balance 2085 AED for instant access while committing the rest (about 86052 AED) into diversified assets or higher returns if liquidity is not an immediate concern.", "relatedReserve": "null", "potentialYearly": null, "potentialMonthly": null}, {"risk": "high", "title": "📈 Stock Market Investment", "description": "Consider allocating a portion of your cash reserves towards a low-cost index fund to capture market growth, potentially allocating 30000 AED initially for an average 7% annual return, yielding around 175 AED monthly or 2100 AED yearly.", "relatedReserve": "cash", "potentialYearly": 2100, "potentialMonthly": 175}]	2026-03-03 20:55:12.407
\.


--
-- Data for Name: notification_templates; Type: TABLE DATA; Schema: public; Owner: revenue
--

COPY public.notification_templates (id, key, content, "updatedAt") FROM stdin;
\.


--
-- Data for Name: persons; Type: TABLE DATA; Schema: public; Owner: revenue
--

COPY public.persons (id, name, phone, color, "createdAt", "updatedAt") FROM stdin;
cmm7x74nt00028orq5rdfsawo	negin	\N	#ef4444	2026-03-01 15:44:04.697	2026-03-02 06:11:22.264
\.


--
-- Data for Name: reserve_snapshots; Type: TABLE DATA; Schema: public; Owner: revenue
--

COPY public.reserve_snapshots (id, "reserveId", amount, note, "recordedAt") FROM stdin;
cmm9hkcgp00028oz7ikrelbhb	cmm9hkcgj00008oz73npo118u	1000000.00	Initial value	2026-03-02 18:01:59.834
cmm9hpn5900048oz7p219nwnq	cmm9hkcgj00008oz73npo118u	2000000.00	\N	2026-03-02 18:06:06.939
cmm9jh4gl00078ok6zsnc1hee	cmm9hkcgj00008oz73npo118u	1000000000.00	Updated via edit	2026-03-02 18:55:28.725
cmm9jjaai000a8ok64b1fpk1g	cmm9jjaag00088ok64gg1ps9s	459.00	Initial value	2026-03-02 18:57:09.595
cmm9jjyty000d8ok6psanx0wy	cmm9jjytu000b8ok63zh6qjqk	360.00	Initial value	2026-03-02 18:57:41.398
cmm9jkyck000g8ok6mcaqot4o	cmm9jkych000e8ok67wbvf8av	2100.00	Initial value	2026-03-02 18:58:27.429
cmm9jov9f000j8ok69678nspk	cmm9jov97000h8ok6zi6b479y	5640.00	Initial value	2026-03-02 19:01:30.051
cmm9jy1ko000m8ok6r4cdzpgj	cmm9jy1kk000k8ok6lq2vfo62	93.39	Initial value	2026-03-02 19:08:38.136
cmm9jyy0s000p8ok6m2unhlfj	cmm9jyy0n000n8ok6dul8ujvr	87.00	Initial value	2026-03-02 19:09:20.189
cmm9jzrrd000s8ok6eylxg4vv	cmm9jzrra000q8ok6erloywe3	25.00	Initial value	2026-03-02 19:09:58.729
cmm9k9mhx000v8ok6qkov26gh	cmm9k9mhs000t8ok6fa3ar9xg	256000000.00	Initial value	2026-03-02 19:17:38.47
cmm9kb3ce000y8ok6dbaecfvy	cmm9kb3c8000w8ok6jh0p2cle	500000000.00	Initial value	2026-03-02 19:18:46.958
cmm9kcud300118ok6jqjso6gp	cmm9kcucz000z8ok67a8r8wxb	1500000000.00	Initial value	2026-03-02 19:20:08.632
cmm9khice00148ok6qwhfecuk	cmm9khic900128ok6tw11w0tz	43000.00	Initial value	2026-03-02 19:23:46.335
cmm9kipjd00178ok6yhbxintt	cmm9kipj800158ok6awrpuzw4	4997.00	Initial value	2026-03-02 19:24:42.313
cmm9kjidt001a8ok6g1ddqwc5	cmm9kjidq00188ok6d0mxxr21	5000.00	Initial value	2026-03-02 19:25:19.698
\.


--
-- Data for Name: reserves; Type: TABLE DATA; Schema: public; Owner: revenue
--

COPY public.reserves (id, name, amount, currency, type, location, note, "createdAt", "updatedAt") FROM stdin;
cmm9jjaag00088ok64gg1ps9s	M Bank Sina	459.00	AED	cash	Bank	\N	2026-03-02 18:57:09.592	2026-03-02 18:57:09.592
cmm9jjytu000b8ok63zh6qjqk	M Bank Farnoosh	360.00	AED	cash	Bank	\N	2026-03-02 18:57:41.393	2026-03-02 18:57:41.393
cmm9jkych000e8ok67wbvf8av	Dollor Cash	2100.00	USD	cash	Home	\N	2026-03-02 18:58:27.424	2026-03-02 18:58:27.424
cmm9jov97000h8ok6zi6b479y	USDC Cryprto Trust Wallet	5640.00	USD	crypto	Trust Wallet	\N	2026-03-02 19:01:30.041	2026-03-02 19:01:30.041
cmm9jy1kk000k8ok6lq2vfo62	HTX Wallet	93.39	USD	crypto	HTX Wallet	\N	2026-03-02 19:08:38.132	2026-03-02 19:08:38.132
cmm9jyy0n000n8ok6dul8ujvr	Kast App	87.00	USD	crypto	Kast App	\N	2026-03-02 19:09:20.182	2026-03-02 19:09:20.182
cmm9jzrra000q8ok6erloywe3	Binance Wallet	25.00	USD	cash	Binance	\N	2026-03-02 19:09:58.725	2026-03-02 19:09:58.725
cmm9k9mhs000t8ok6fa3ar9xg	Blu Bank Cash	256000000.00	IRR	cash	Bank	\N	2026-03-02 19:17:38.447	2026-03-02 19:17:58.535
cmm9kcucz000z8ok67a8r8wxb	The money I owe Hadi	1500000000.00	IRR	cash	Hadi,Iran	\N	2026-03-02 19:20:08.627	2026-03-02 19:20:08.627
cmm9khic900128ok6tw11w0tz	Mashreq Bank Company	43000.00	AED	cash	Bank	\N	2026-03-02 19:23:46.309	2026-03-02 19:23:46.309
cmm9kipj800158ok6awrpuzw4	Mashreq Bank Sina	4997.00	AED	cash	Bank	\N	2026-03-02 19:24:42.307	2026-03-02 19:24:42.307
cmm9kjidq00188ok6d0mxxr21	Mashreq Bank Farnoosh	5000.00	AED	cash	Bank	\N	2026-03-02 19:25:19.693	2026-03-02 19:25:19.693
cmm9hkcgj00008oz73npo118u	Loan to Farzad	1000000000.00	IRR	cash	Iran	\N	2026-03-02 18:01:59.825	2026-03-02 19:26:31.825
cmm9kb3c8000w8ok6jh0p2cle	Loan to Muhammad	500000000.00	IRR	cash	Iran	\N	2026-03-02 19:18:46.951	2026-03-02 19:26:46.114
\.


--
-- Data for Name: savings_goals; Type: TABLE DATA; Schema: public; Owner: revenue
--

COPY public.savings_goals (id, name, "targetAmount", "currentAmount", deadline, color, status, "createdAt", "updatedAt") FROM stdin;
cmm7vjxrn00028o1fuu7khu04	Buy Padel	10000.00	10000.00	2026-03-03 00:00:00	#e704c9	completed	2026-03-01 14:58:03.058	2026-03-01 15:50:41.395
cmm7xq0uy000f8orqer1q2gse	Buy ....	2000.00	0.00	2026-03-04 00:00:00	#10b981	active	2026-03-01 15:58:46.233	2026-03-01 15:58:55.953
\.


--
-- Data for Name: settlements; Type: TABLE DATA; Schema: public; Owner: revenue
--

COPY public.settlements (id, "personId", amount, date, note, source, "createdAt") FROM stdin;
\.


--
-- Data for Name: shopping_list_items; Type: TABLE DATA; Schema: public; Owner: revenue
--

COPY public.shopping_list_items (id, "listId", "itemName", "normalizedName", quantity, "sortOrder", "createdAt") FROM stdin;
cmm9clplr00058oi8of1v159f	cmm9ckwbx00018oi80zle98r2	SALMON FILLET	Fish	1	0	2026-03-02 15:43:05.44
cmm9f8t57000c8o5j6txbopai	cmm9f73mv00008o5jwdtbr93x	SHOPPING BAG	Shopping Bag	1	4	2026-03-02 16:57:02.347
cmm9f9ekh000e8o5jznvj9s1g	cmm9f73mv00008o5jwdtbr93x	SALMON FILLET	Fish	1	5	2026-03-02 16:57:30.114
cmm9fo8ji000g8o5jg50l3hga	cmm9f73mv00008o5jwdtbr93x	Taksa Dry Mint 150g	taksa dry mint 150g	1	6	2026-03-02 17:09:02.142
\.


--
-- Data for Name: shopping_lists; Type: TABLE DATA; Schema: public; Owner: revenue
--

COPY public.shopping_lists (id, name, "createdAt", "updatedAt") FROM stdin;
cmm9ckwbx00018oi80zle98r2	food	2026-03-02 15:42:27.5	2026-03-02 15:43:05.441
cmm9f73mv00008o5jwdtbr93x	groceries	2026-03-02 16:55:42.631	2026-03-02 17:09:02.147
\.


--
-- Data for Name: sms_patterns; Type: TABLE DATA; Schema: public; Owner: revenue
--

COPY public.sms_patterns (id, name, regex, type, priority, "amountCaptureGroup", "merchantCaptureGroup", enabled, "creditKeywords", "createdAt", "updatedAt") FROM stdin;
cmm8ysdc900028omx683tr5e4	Salary Credit	salary.*?AED\\s+([\\d,]+\\.?\\d*)	income	30	1	\N	t	\N	2026-03-02 09:16:21.512	2026-03-02 09:16:21.512
cmm8ysdc900038omxmonyhsxb	Salary Credit (alt)	AED\\s+([\\d,]+\\.?\\d*)\\s+.*?(?:salary|credited)	income	31	1	\N	t	\N	2026-03-02 09:16:21.512	2026-03-02 09:16:21.512
cmm8ysdc900048omx707gkgek	ATM Withdrawal	AED\\s+([\\d,]+\\.?\\d*)\\s+.*?(?:withdrawn|ATM|cash)	expense	40	1	\N	t	\N	2026-03-02 09:16:21.512	2026-03-02 09:16:21.512
cmm8ysdc900058omxfuzlgfjy	Generic AED Amount	AED\\s+([\\d,]+\\.?\\d*)	auto	99	1	\N	t	deposit,credit,receiv,salary,transfer to your	2026-03-02 09:16:21.512	2026-03-02 09:16:21.512
cmm8ysdc900008omx1obr7dgg	Mashreq Purchase	for\\s+AED\\s+([\\d,]+\\.?\\d*)\\s+at\\s+(.+?)\\s+on\\s+\\d{2}-[A-Z]{3}-\\d{4}	expense	50	1	2	t	\N	2026-03-02 09:16:21.512	2026-03-02 09:16:42.539
cmm8ysdc900018omxc8tl6e3l	Mashreq Deposit	AED\\s+([\\d,]+\\.?\\d*)\\s+has been deposited	income	50	1	\N	t	\N	2026-03-02 09:16:21.512	2026-03-02 09:16:43.507
\.


--
-- Data for Name: tags; Type: TABLE DATA; Schema: public; Owner: revenue
--

COPY public.tags (id, name, color, "createdAt", "updatedAt") FROM stdin;
cmm7re9ee00008o25rqjyre0t	iphone	#ef4444	2026-03-01 13:01:39.734	2026-03-01 13:01:39.734
\.


--
-- Data for Name: transaction_items; Type: TABLE DATA; Schema: public; Owner: revenue
--

COPY public.transaction_items (id, "transactionId", name, quantity, "unitPrice", "totalPrice", "sortOrder", "createdAt", "normalizedName") FROM stdin;
cmm9bahz100378oes87tddkn9	cmm8zcne000078omxjlszen0e	ABALI DOUGH 1LTR	1	10	10	3	2026-03-02 15:06:22.717	abali dough 1ltr
cmm9bahz100388oes1ehto0dr	cmm8zcne000078omxjlszen0e	Golestan Dried Thyme 35g	1	3	3	4	2026-03-02 15:06:22.717	golestan dried thyme 35g
cmm9bahz1003b8oesqdcjpiek	cmm8zcne000078omxjlszen0e	KAMBIZ OLIVE PICKLE PITTED 450G	1	15	15	7	2026-03-02 15:06:22.717	kambiz olive pickle pitted 450g
cmm99fhcg000s8oesm6uxbd3i	message890	ONION RED	1	1.85	1.85	5	2026-03-02 14:14:15.952	onion red
cmm9bahz100358oesfrsxkqit	cmm8zcne000078omxjlszen0e	N Haraz Cream 200ml	1	6	6	1	2026-03-02 15:06:22.717	n haraz cream 200ml
cmm9bahz1003c8oesh59czz89	cmm8zcne000078omxjlszen0e	N Pamchal Cucumber Pickle Excellent 1040g	1	12	12	8	2026-03-02 15:06:22.717	n pamchal cucumber pickle excellent 1040g
cmm9bahz000348oes3e0dcia5	cmm8zcne000078omxjlszen0e	N Golestan Baking Soda 180Gr	1	5	5	0	2026-03-02 15:06:22.717	n golestan baking soda 180gr
cmm99fhcg001c8oesnslvnkzk	message890	HEALTH STICK 100GR	1	7.39	7.39	25	2026-03-02 14:14:15.952	health stick 100gr
cmm9bahz1003d8oes8r6cx7u6	cmm8zcne000078omxjlszen0e	SHOPPING BAG	2	0.25	0.5	9	2026-03-02 15:06:22.717	Shopping Bag
cmm9bahz100398oesotbfv0y8	cmm8zcne000078omxjlszen0e	Taksa Dry Mint 150g	1	10	10	5	2026-03-02 15:06:22.717	taksa dry mint 150g
cmm99fhcg00178oesugxx54wg	message890	BREAD BAKERY SLIC 650G	1	2.25	2.25	20	2026-03-02 14:14:15.952	bread bakery slic 650g
cmm9bahz1003a8oes5tv1dpli	cmm8zcne000078omxjlszen0e	KIWI GREEN KG	0.97	10.31	9.69	6	2026-03-02 15:06:22.717	kiwi green kg
cmm9bahz1003g8oes0rxtqoru	cmm8zcne000078omxjlszen0e	Eggs New	1	30	30	12	2026-03-02 15:06:22.717	Eggs
cmm99fhcg001a8oesy48fi03r	message890	BARILLA PASTA500G	1	2.5	2.5	23	2026-03-02 14:14:15.952	barilla pasta500g
cmm99fhcg00188oes3aagerqh	message890	PLAST SHOPPING BAG	1	0.25	0.25	21	2026-03-02 14:14:15.952	Shopping Bag
cmm99fhcg000u8oes8unjpy9f	message890	PEACH FLAT	1	26.91	26.91	7	2026-03-02 14:14:15.952	peach flat
cmm9bahz100368oes379a039a	cmm8zcne000078omxjlszen0e	N Haraz Shallot Yoghurt 450g	2	7	14	2	2026-03-02 15:06:22.717	n haraz shallot yoghurt 450g
cmm9bahz1003e8oesss75mgp0	cmm8zcne000078omxjlszen0e	STRAWBERRY TRAY	1	15	15	10	2026-03-02 15:06:22.717	strawberry tray
cmm9bahz1003h8oeskhmgwqix	cmm8zcne000078omxjlszen0e	SALMON FILLET	1	41	41	13	2026-03-02 15:06:22.717	Fish
cmm9bahz1003f8oestx10tb7i	cmm8zcne000078omxjlszen0e	PERSIMON IRI TRAY	1	20	20	11	2026-03-02 15:06:22.717	persimon iri tray
cmm99fhcg000x8oesinr1zboq	message890	DRISCOLL'S STRAWB	1	6.99	6.99	10	2026-03-02 14:14:15.952	driscoll's strawb
cmm99fhcg001b8oeskzz3crmq	message890	NAIMAN'S CC B 200G	1	13.99	13.99	24	2026-03-02 14:14:15.952	naiman's cc b 200g
cmm99fhch001k8oesngaijr1b	message890	PLAST SHOPPING BAG	1	0.25	0.25	33	2026-03-02 14:14:15.952	Shopping Bag
cmm99fhch001l8oesnuywhc71	message890	NOR SALMON FILLET	1	62.86	62.86	34	2026-03-02 14:14:15.952	Fish
cmm99fhcg00108oesvpiepuc8	message890	KIWI EP PP	1	7.99	7.99	13	2026-03-02 14:14:15.952	kiwi ep pp
cmm99fhch001f8oese6l1p64r	message890	BARBELLS BAR 56G	1	15.29	15.29	28	2026-03-02 14:14:15.952	barbells bar 56g
cmm99fhch001i8oest0xl1b7f	message890	BARBELLS BAR 56G	1	16.29	16.29	31	2026-03-02 14:14:15.952	barbells bar 56g
cmm99fhcg00118oesftfwqx9f	message890	HEINZ KTP 400MLX2	1	11.99	11.99	14	2026-03-02 14:14:15.952	heinz ktp 400mlx2
cmm99fhcg001d8oescksithn1	message890	KIT KAT MP 40GX4	1	11.79	11.79	26	2026-03-02 14:14:15.952	kit kat mp 40gx4
cmm99fhcg00198oesk7zqe0cf	message890	BOYRA DATE SAGA1 40	1	18.99	18.99	22	2026-03-02 14:14:15.952	boyra date saga1 40
cmm99fhch001h8oesek3qh7b6	message890	PEANUT CARAMEL	1	16.29	16.29	30	2026-03-02 14:14:15.952	peanut caramel
cmm99fhch001g8oesvglk8e2a	message890	BARBELLS BAR 56G	1	15.29	15.29	29	2026-03-02 14:14:15.952	barbells bar 56g
cmm99fhch001e8oesq33rqr7w	message890	SKITTLES 386G	1	2.69	2.69	27	2026-03-02 14:14:15.952	skittles 386g
cmm99fhch001n8oessmu9iy8f	message890	Eggs Big	1	15	15	36	2026-03-02 14:14:15.952	Eggs
cmm99fhch001m8oesgdzvt3og	message890	FINE TR 4R 3PLY	1	11.99	11.99	35	2026-03-02 14:14:15.952	fine tr 4r 3ply
cmm99fhcg00138oes4i1d9zk3	message890	NADA GY LF PL360GR	1	10.49	10.49	16	2026-03-02 14:14:15.952	nada gy lf pl360gr
cmm99fhcg000p8oest27co2lt	message890	POTATO EP	1	2.6	2.6	2	2026-03-02 14:14:15.952	potato ep
cmm99fhcg000n8oespe6c88a0	message890	PLAST SHOPPING BAG	1	0.25	0.25	0	2026-03-02 14:14:15.952	Shopping Bag
cmm99fhcg000v8oesr3cz67fv	message890	PLUM YELLOW	1	26.48	26.48	8	2026-03-02 14:14:15.952	plum yellow
cmm99fhcg000t8oeswxy1tlhq	message890	APPLE GREEN	1	1.85	1.85	6	2026-03-02 14:14:15.952	apple green
cmm99fhcg000z8oesbxxub89n	message890	SWEET CORN PP EP	1	7.89	7.89	12	2026-03-02 14:14:15.952	sweet corn pp ep
cmm99fhcg000o8oesxfze5q8s	message890	PLAST SHOPPING BAG	1	0.25	0.25	1	2026-03-02 14:14:15.952	Shopping Bag
cmm99fhcg000q8oesgjyksmi2	message890	PEAR FORELLE	1	6.85	6.85	3	2026-03-02 14:14:15.952	pear forelle
cmm99fhcg00158oes2bqwerkl	message890	MOZZAR 650GR	1	20.29	20.29	18	2026-03-02 14:14:15.952	mozzar 650gr
cmm99fhcg000y8oesb07o7yak	message890	CAPSICUM MIX PACK	1	6.89	6.89	11	2026-03-02 14:14:15.952	capsicum mix pack
cmm99fhch001j8oesk6rr2lvp	message890	COCO THUMB PREMIUM	1	2.49	2.49	32	2026-03-02 14:14:15.952	coco thumb premium
cmm99fhcg00168oesc02eb69e	message890	GOLDFARM PIZZA 800G	1	11.5	11.5	19	2026-03-02 14:14:15.952	goldfarm pizza 800g
cmm9al4ua002n8oes74bt18lr	message902	Nescafe 2 in 1 30x11.7g Sugar Free	1	1.25	3.75	10	2026-03-02 14:46:39.298	nescafe 2 in 1 30x11.7g sugar free
cmm9al4u9002e8oesp4b98141	message902	Sweet Potato	0.404	4.95	2	1	2026-03-02 14:46:39.298	sweet potato
cmm9al4u9002f8oeszfjguw84	message902	Beetroot	0.424	4.95	2.1	2	2026-03-02 14:46:39.298	beetroot
cmm9al4ua002j8oesx8t39hxl	message902	Kiwi New Zealand Per Piece	6	4.25	25.5	6	2026-03-02 14:46:39.298	kiwi new zealand per piece
cmm9al4u9002h8oeshmsyrzhg	message902	Nectarine South Africa	1	24.95	17.85	4	2026-03-02 14:46:39.298	nectarine south africa
cmm9al4u9002d8oes4s4vuq4g	message902	Oxo Bio Shopping Bag	1	0.25	0.25	0	2026-03-02 14:46:39.298	Shopping Bag
cmm9al4ua002m8oesbaahqfbr	message902	Al Jazira Eggs White Family Pack	1	15.95	15.95	9	2026-03-02 14:46:39.298	Eggs
cmm9al4u9002i8oesrwrihl9q	message902	Banana Chiquita Equador	0.396	7.95	3.15	5	2026-03-02 14:46:39.298	banana chiquita equador
cmm9al4u9002g8oesjuy6urqz	message902	Bertolli Extra Light Olive Oil 750ml	1	53.5	53.5	3	2026-03-02 14:46:39.298	bertolli extra light olive oil 750ml
cmm9al4ua002l8oeship4azvh	message902	Glad Aluminium Foil 200 SQ.FT	1	39.95	39.95	8	2026-03-02 14:46:39.298	glad aluminium foil 200 sq.ft
cmm9al4ua002k8oesoauehz0j	message902	Tomato Pack of 6	1	5.95	5.95	7	2026-03-02 14:46:39.298	tomato pack of 6
cmm99fhcg00148oesgfktj5zc	message890	HEINZ DRESSING225ML	1	12.99	12.99	17	2026-03-02 14:14:15.952	heinz dressing225ml
cmm9al4ua002p8oes0sb28o0i	message902	BARBELLS BAR 56G	1	13	13	12	2026-03-02 14:46:39.298	barbells bar 56g
cmm9al4ua002o8oesbxr5sg57	message902	Eggs Pass	1	45	45	11	2026-03-02 14:46:39.298	Eggs
cmm99fhcg000r8oesap9jmutf	message890	BEETROOT	1	1.76	1.76	4	2026-03-02 14:14:15.952	beetroot
cmm99fhcg00128oesr2gfa600	message890	PONTI VINEGAR 260M	1	16.29	16.29	15	2026-03-02 14:14:15.952	ponti vinegar 260m
cmm99fhcg000w8oesgd6m1byk	message890	DRISCOLL'S STRAWB	1	6.99	6.99	9	2026-03-02 14:14:15.952	driscoll's strawb
\.


--
-- Data for Name: transaction_splits; Type: TABLE DATA; Schema: public; Owner: revenue
--

COPY public.transaction_splits (id, "transactionId", "categoryId", amount, description, "createdAt", "personId") FROM stdin;
cmm7uvyrk00008o1fvihhl60i	cmm7te3m8000m8o2561jw4mc9	cmm56s17800028ogefz2eqqt0	100.00	\N	2026-03-01 14:39:24.608	\N
cmm7uvyrk00018o1fkpaj1dma	cmm7te3m8000m8o2561jw4mc9	cmm5cqzf10001pw01d9pekwf0	27.48	\N	2026-03-01 14:39:24.608	\N
cmm92i0q500088omxeo33sow1	cmm7x74nn00018orqsz4egwr8	cmm56s17800028ogefz2eqqt0	200.00	\N	2026-03-02 11:00:17.069	\N
cmm92i0q500098omxq7wjcdw4	cmm7x74nn00018orqsz4egwr8	cmm56s17600018ogeqghk7vfb	50.00	11	2026-03-02 11:00:17.069	\N
cmm92i0q5000a8omxcawp6due	cmm7x74nn00018orqsz4egwr8	cmm56s17i00098oge2xb5or4t	250.00	\N	2026-03-02 11:00:17.069	cmm7x74nt00028orq5rdfsawo
cmm92sjc8000b8omxbla7r4sp	message976	cmm56s17600018ogeqghk7vfb	82.00	\N	2026-03-02 11:08:27.753	\N
cmm92sjc8000c8omxheq73k7d	message976	cmm56s17600018ogeqghk7vfb	72.00	\N	2026-03-02 11:08:27.753	cmm7x74nt00028orq5rdfsawo
\.


--
-- Data for Name: transaction_tags; Type: TABLE DATA; Schema: public; Owner: revenue
--

COPY public.transaction_tags ("transactionId", "tagId") FROM stdin;
message1075	cmm7re9ee00008o25rqjyre0t
\.


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: revenue
--

COPY public.transactions (id, date, "time", amount, currency, type, "categoryId", merchant, description, items, source, "hasReceipt", "mediaFiles", "createdAt", "updatedAt", "mergedIntoId", "accountId", "spreadMonths") FROM stdin;
message7	2024-11-02 00:00:00	21:51	1000.00	AED	income	cmm56s17000008ogezghgfclk	Mashreq ATM	اولین واریزی به حساب از طریق دستگاه ATM	ATM cash deposit, 10x AED 100 notes	image	t	{photos/photo_1@02-11-2024_21-51-24.jpg}	2026-02-27 17:48:58.031	2026-02-27 17:48:58.031	\N	default_farnoosh_mashreq	\N
message691	2025-11-09 00:00:00	12:18	903.44	AED	expense	cmm56s17m000c8ogerjdoev6e	Tabby (Belhasa Driving Center)	\N	Tabby installment for Belhasa Driving Center	image	t	{photos/photo_387@09-11-2025_12-18-45.jpg}	2026-02-27 17:48:58.411	2026-02-28 09:11:26.398	message692	default_farnoosh_mashreq	\N
message9	2024-11-02 00:00:00	21:54	74.82	AED	expense	cmm56s17800028ogefz2eqqt0	Carrefour	خرید کارفور در امارات مال	Lettuce, carrot, apple, tomato, orange, capsicum, cucumber, bananas, chicken fillet, eggs	image	t	{photos/photo_3@02-11-2024_21-54-44.jpg}	2026-02-27 17:48:58.031	2026-02-27 17:48:58.031	\N	default_farnoosh_mashreq	\N
message14	2024-11-03 00:00:00	23:53	4.00	AED	expense	cmm56s17800028ogefz2eqqt0	GALA Supermarket	نون و آب	Alna bottled water x3, bread x1	image	t	{photos/photo_5@03-11-2024_23-53-30.jpg}	2026-02-27 17:48:58.031	2026-02-27 17:48:58.031	\N	default_farnoosh_mashreq	\N
message15	2024-11-04 00:00:00	17:22	35.00	AED	expense	cmm56s17900038ogeyynewip3	Hala Taxi	کریم رفت به فینگرپرینت سینا - Al Ghazal	Taxi ride Business Bay to Al Badaa, 11.4km	image	t	{photos/photo_6@04-11-2024_17-22-35.jpg}	2026-02-27 17:48:58.031	2026-02-27 17:48:58.031	\N	default_farnoosh_mashreq	\N
message16	2024-11-04 00:00:00	17:23	33.00	AED	expense	cmm56s17900038ogeyynewip3	Cars Taxi Services Co LLC (Network)	کریم رفت به فینگرپرینت سینا - مرکز دیره	["taxi ride (fingerprint appointment, Deira center)"]	image	t	{photos/photo_7@04-11-2024_17-23-00.jpg}	2026-02-27 17:48:58.031	2026-02-27 17:48:58.031	\N	default_farnoosh_mashreq	\N
message17	2024-11-04 00:00:00	17:23	21.50	AED	expense	cmm56s17800028ogefz2eqqt0	Urban Fresh Supermarket (Al Khaleej Al Teejari)	خرید آب دلستر بستنی	["water, non-alcoholic beer, ice cream"]	image	t	{photos/photo_8@04-11-2024_17-23-12.jpg}	2026-02-27 17:48:58.031	2026-02-27 17:48:58.031	\N	default_farnoosh_mashreq	\N
message18	2024-11-05 00:00:00	12:17	2.99	AED	expense	cmm56s17800028ogefz2eqqt0	GALA Supermarket LLC (AG Tower, Business Bay)	نون	["T. French Bread Big x1"]	image	t	{photos/photo_9@05-11-2024_12-17-34.jpg}	2026-02-27 17:48:58.031	2026-02-27 17:48:58.031	\N	default_farnoosh_mashreq	\N
message19	2024-11-09 00:00:00	19:02	20.00	AED	expense	cmm56s17900038ogeyynewip3	RTA	شارژ کارت مترو nol فرنوش	Nol metro card recharge for Farnoosh	file	t	{files/Gmail_DubaiPay_Notification_for_Transaction_No_EPRL202411051959350014071.pdf}	2026-02-27 17:48:58.031	2026-02-27 17:48:58.031	\N	default_farnoosh_mashreq	\N
message20	2024-11-09 00:00:00	19:12	33.30	AED	expense	cmm56s17900038ogeyynewip3	Careem	کریم به دبی مال - قرار با ونوس	Careem ride to Dubai Mall	image	t	{photos/photo_10@09-11-2024_19-12-06.jpg}	2026-02-27 17:48:58.031	2026-02-27 17:48:58.031	\N	default_farnoosh_mashreq	\N
message21	2024-11-09 00:00:00	19:12	25.00	AED	expense	cmm56s17600018ogeqghk7vfb	Hippo Box Supermarket Co LLC (Dubai Mall, Burj Khalifa)	خرید بستنی انبه در دبی مال - با ونوس	["HONG QI Ice Cream Mango 75g x1"]	image	t	{photos/photo_11@09-11-2024_19-12-55.jpg}	2026-02-27 17:48:58.031	2026-02-27 17:48:58.031	\N	default_farnoosh_mashreq	\N
message23	2024-11-09 00:00:00	19:31	2.99	AED	expense	cmm56s17800028ogefz2eqqt0	GALA Supermarket LLC (AG Tower, Business Bay)	نان	["T. Bread Berries Arab x1"]	image	t	{photos/photo_12@09-11-2024_19-31-01.jpg}	2026-02-27 17:48:58.031	2026-02-27 17:48:58.031	\N	default_farnoosh_mashreq	\N
message24	2024-11-09 00:00:00	19:31	56.00	AED	expense	cmm56s17600018ogeqghk7vfb	Pizza Hut	پیتزا هات	Pizza Hut at Circle Mall	image	t	{photos/photo_13@09-11-2024_19-31-50.jpg}	2026-02-27 17:48:58.031	2026-02-27 17:48:58.031	\N	default_farnoosh_mashreq	\N
message25	2024-11-09 00:00:00	19:32	10.00	AED	expense	cmm56s17600018ogeqghk7vfb	McDonald's	مک دونالد	1 Regular Fries at Circle Mall	image	t	{photos/photo_14@09-11-2024_19-32-41.jpg}	2026-02-27 17:48:58.031	2026-02-27 17:48:58.031	\N	default_farnoosh_mashreq	\N
message29	2024-11-09 00:00:00	19:39	2900.00	AED	income	cmm56s17000008ogezghgfclk	Mashreq Al Islami ATM (7847101-MOE, Dubai)	واریز به حساب از طریق دستگاه ATM	["ATM cash deposit (AED 100 x 29 notes) to account 019101544538, Farnoosh Bagheri"]	image	t	{photos/photo_17@09-11-2024_19-39-12.jpg}	2026-02-27 17:48:58.031	2026-02-27 17:48:58.031	\N	default_farnoosh_mashreq	\N
message30	2024-11-09 00:00:00	19:39	300.00	AED	income	cmm56s17000008ogezghgfclk	Mashreq Al Islami ATM (7847101-MOE, Dubai)	واریز به حساب از طریق دستگاه ATM	["ATM cash deposit (AED 100 x 3 notes) to account 019101544538, Farnoosh Bagheri"]	image	t	{photos/photo_18@09-11-2024_19-39-57.jpg}	2026-02-27 17:48:58.031	2026-02-27 17:48:58.031	\N	default_farnoosh_mashreq	\N
message31	2024-11-09 00:00:00	19:40	20.00	AED	expense	cmm56s17a00048ogeacrpia4x	du (mobile recharge)	شارژ کیف پول du فرنوش	["mobile recharge for 971525662144"]	image	t	{photos/photo_19@09-11-2024_19-40-47.jpg}	2026-02-27 17:48:58.031	2026-02-27 17:48:58.031	\N	default_farnoosh_mashreq	\N
message32	2024-11-09 00:00:00	19:42	4.25	AED	expense	cmm56s17800028ogefz2eqqt0	GALA Supermarket LLC (AG Tower, Business Bay)	آب و آب پرتقال	["T. Alna Bottled Drink x1 (1.25), T. Murrum Orange Juice x1 (3.00)"]	image	t	{photos/photo_20@09-11-2024_19-42-35.jpg}	2026-02-27 17:48:58.031	2026-02-27 17:48:58.031	\N	default_farnoosh_mashreq	\N
message33	2024-11-09 00:00:00	19:52	34.50	AED	expense	cmm56s17900038ogeyynewip3	RTA Dubai Taxi (Fleet: Dubai Taxi, Taxi XC350)	کریم برای انگشت نگاری سینا به مرکز Al Ghazal	["taxi ride from Business Bay 1 to Al Badaa, 11.77km, 16 mins"]	image	t	{photos/photo_21@09-11-2024_19-52-43.jpg}	2026-02-27 17:48:58.031	2026-02-27 17:48:58.031	\N	default_farnoosh_mashreq	\N
message35	2024-11-09 00:00:00	19:54	19.00	AED	expense	cmm56s17900038ogeyynewip3	Cars Taxi Services Co LLC (Network)	کریم از مرکز Al Ghazal به نزدیکترین مترو برای رفتن به فرودگاه	["taxi ride"]	image	t	{photos/photo_22@09-11-2024_19-54-30.jpg}	2026-02-27 17:48:58.031	2026-02-27 17:48:58.031	\N	default_farnoosh_mashreq	\N
message37	2024-11-09 00:00:00	19:55	49.00	AED	expense	cmm56s17a00048ogeacrpia4x	du (Magnati / Dubai Airport T1)	خرید سیمکارت du برای سینا	["du SIM Recharge More Time 1.00 EA, customer: Bagheri Farnoosh"]	image	t	{photos/photo_23@09-11-2024_19-55-58.jpg}	2026-02-27 17:48:58.031	2026-02-27 17:48:58.031	\N	default_farnoosh_mashreq	\N
message39	2024-11-09 00:00:00	19:57	30.00	AED	expense	cmm56s17a00048ogeacrpia4x	du (mobile recharge)	شارژ کیف پول du فرنوش	["mobile recharge for 971525662144"]	image	t	{photos/photo_24@09-11-2024_19-57-25.jpg}	2026-02-27 17:48:58.031	2026-02-27 17:48:58.031	\N	default_farnoosh_mashreq	\N
message8	2024-11-02 00:00:00	21:54	50.00	AED	expense	cmm56s17600018ogeqghk7vfb	Vinci Restaurant	بستنی توی امارات مال	Ice cream at JBR	image	t	{photos/photo_2@02-11-2024_21-54-20.jpg}	2026-02-27 17:48:58.031	2026-02-28 07:27:49.387	\N	default_farnoosh_mashreq	\N
message12	2024-11-02 00:00:00	22:06	3.50	AED	expense	cmm56s17600018ogeqghk7vfb	GALA Supermarket LLC (AG Tower, Business Bay)	بستنی از سوپرمارکت	["T. Swiss Choco Bar 7 x2"]	image	t	{photos/photo_4@02-11-2024_22-06-32.jpg}	2026-02-27 17:48:58.031	2026-02-28 07:28:01.484	\N	default_farnoosh_mashreq	\N
message28	2024-11-09 00:00:00	19:37	11.00	AED	expense	cmm56s17600018ogeqghk7vfb	KFC - Circle Mall (Store 12110)	KFC	["7Up Medium (merchant/card copy of same transaction as photo_15)"] | ["7Up Medium"]	image	t	{photos/photo_16@09-11-2024_19-37-06.jpg,photos/photo_15@09-11-2024_19-37-06.jpg}	2026-02-27 17:48:58.031	2026-02-28 07:30:12.699	\N	default_farnoosh_mashreq	\N
message40	2024-11-09 00:00:00	19:57	50.00	AED	expense	cmm56s17a00048ogeacrpia4x	du (mobile recharge)	شارژ کیف پول du سینا	["mobile recharge for 971551507311"]	image	t	{photos/photo_25@09-11-2024_19-57-25.jpg}	2026-02-27 17:48:58.031	2026-02-27 17:48:58.031	\N	default_farnoosh_mashreq	\N
message611	2025-10-12 00:00:00	13:02	3613.75	AED	expense	cmm56s17m000c8ogerjdoev6e	Belhasa Driving Center	\N	Driving lessons via Tabby in 4 installments	image	t	{photos/photo_330@12-10-2025_13-02-45.jpg}	2026-02-27 17:48:58.342	2026-02-28 09:14:01.576	message610	default_farnoosh_mashreq	\N
message48	2024-12-11 00:00:00	10:32	19.00	AED	expense	cmm56s17900038ogeyynewip3	RTA Hala Taxi (Cars Taxi)	کریم از مترو بیزینس بی به خونه Damac Maison Cour Jardinروز اولی که از فرودگاه رسیدیم	\N	image	t	{photos/photo_29@11-12-2024_10-32-33.jpg}	2026-02-27 17:48:58.031	2026-02-27 17:48:58.031	\N	default_farnoosh_mashreq	\N
message49	2024-12-11 00:00:00	10:48	37.00	AED	expense	cmm56s17900038ogeyynewip3	RTA Hala Taxi (Dubai Taxi)	کریم از عزیزی به خونه Maison Cour Jardin	\N	image	t	{photos/photo_30@11-12-2024_10-48-02.jpg}	2026-02-27 17:48:58.031	2026-02-27 17:48:58.031	\N	default_farnoosh_mashreq	\N
message50	2024-12-11 00:00:00	10:49	22.98	AED	expense	cmm56s17900038ogeyynewip3	Careem	کریم از Maison Cour Jardin به ایستگاه مترو بیزینس بی 22.98رسید نداشت بدهتاریخ ۸ دسامبر	Careem ride from Maison Cour Jardin to Business Bay metro station	text	f	{}	2026-02-27 17:48:58.031	2026-02-27 17:48:58.031	\N	default_farnoosh_mashreq	\N
message51	2024-12-11 00:00:00	11:03	40.00	AED	expense	cmm56s17900038ogeyynewip3	Car On Call Limousine (Magnati POS)	اوبر از عزیزی به خونه Maison Cour Jardin	\N	image	t	{photos/photo_31@11-12-2024_11-03-32.jpg}	2026-02-27 17:48:58.031	2026-02-27 17:48:58.031	\N	default_farnoosh_mashreq	\N
message52	2024-12-11 00:00:00	11:14	2056.00	AED	expense	cmm56s17e00068ogeybi889nb	Stonetree Vacation Homes	پرداخت دیپازیت به خونه یکماهه	Security deposit for 1-month house rental at Lake Terrace 214	file	t	{files/Gmail_Your_Receipt_from_Stonetree_Vacation_Homes_Rental_LLC.pdf}	2026-02-27 17:48:58.031	2026-02-27 17:48:58.031	\N	default_farnoosh_mashreq	\N
message53	2024-12-11 00:00:00	11:15	5000.00	AED	income	cmm56s17000008ogezghgfclk	Mashreq ATM (MOE branch)	واریز 5000 درهم پول نقد از طریق ATM	\N	image	t	{photos/photo_32@11-12-2024_11-15-28.jpg}	2026-02-27 17:48:58.031	2026-02-27 17:48:58.031	\N	default_farnoosh_mashreq	\N
message54	2024-12-12 00:00:00	17:54	20.12	AED	expense	cmm56s17900038ogeyynewip3	Careem	کریم موتور از جناحی برای دریافت کارت اقامت سینا	\N	image	t	{photos/photo_33@12-12-2024_17-54-17.jpg}	2026-02-27 17:48:58.031	2026-02-27 17:48:58.031	\N	default_farnoosh_mashreq	\N
message55	2024-12-12 00:00:00	17:57	14.50	AED	expense	cmm56s17900038ogeyynewip3	RTA Hala Taxi (Metro Taxi)	کریم از بیزینس بی به مترو  برای جا به جایی به JLT	\N	image	t	{photos/photo_34@12-12-2024_17-57-27.jpg}	2026-02-27 17:48:58.031	2026-02-27 17:48:58.031	\N	default_farnoosh_mashreq	\N
message56	2024-12-12 00:00:00	17:58	3000.00	AED	income	cmm56s17000008ogezghgfclk	Mashreq ATM (Mashreq Metro S branch)	واریز پول از طریق دستگاه ATM	\N	image	t	{photos/photo_35@12-12-2024_17-58-29.jpg}	2026-02-27 17:48:58.031	2026-02-27 17:48:58.031	\N	default_farnoosh_mashreq	\N
message57	2024-12-12 00:00:00	17:58	2000.00	AED	income	cmm56s17000008ogezghgfclk	Mashreq ATM (Mashreq Metro S branch)	واریز پول از طریق دستگاه ATM	\N	image	t	{photos/photo_36@12-12-2024_17-58-39.jpg}	2026-02-27 17:48:58.031	2026-02-27 17:48:58.031	\N	default_farnoosh_mashreq	\N
message58	2024-12-14 00:00:00	11:47	41.60	AED	expense	cmm56s17800028ogefz2eqqt0	Viva Supermarket (Oasis Center, Al Quoz)	Viva	["White eggs 30s - 11.99","Feta white cheese 250g - 3.99","Natural yoghurt 400g - 3.19","Orange 1kg - 4.82","Large brown bread 600g - 5.99","Apple Gala 1kg - 5.09","Pineapple PET 500ml - 2.29","Bottle water 6x1L - 3.99","Viva shopping bag - 0.25"]	image	t	{photos/photo_37@14-12-2024_11-47-44.jpg}	2026-02-27 17:48:58.031	2026-02-27 17:48:58.031	\N	default_farnoosh_mashreq	\N
message60	2024-12-14 00:00:00	11:48	176.17	AED	expense	cmm56s17800028ogefz2eqqt0	Carrefour Market (JLT Palladium, Dubai)	Carrefour	["M/Bakery Roll 245g x2 - 5.58","Potato EP - 2.20","Aus BF Mince - 21.40","Garlic white kg - 2.00","Capsicum green - 2.15","CRF Tomato 700g - 9.95","Potato EP - 1.60","American G. 254g - 18.25","Kalleh Hotdog 300g - 12.40","Pomegranate red - 11.60","Lettuce iceberg PP - 7.50","Broccoli EP - 3.95","Cucumber kg EP - 1.60","Namakin 1.1kg - 15.45","Barbican 330ml x2 - 8.50","Saha Breast 450g - 22.60","Plast shopping bag - 0.25","Lime green - 2.25","Ariel green - 6.25","Kalleh Lab 600ml - 3.79","CRF Halwa Pi 500g - 12.75","Mushroom white PP - 5.15"]	image	t	{photos/photo_38@14-12-2024_11-48-53.jpg}	2026-02-27 17:48:58.031	2026-02-27 17:48:58.031	\N	default_farnoosh_mashreq	\N
message64	2024-12-14 00:00:00	20:39	1.25	AED	expense	cmm56s17800028ogefz2eqqt0	Nour Daily Mart (Lake City Tower, JLT)	پیاز	["Onions Red - 1.16 (net) + 0.06 VAT"]	image	t	{photos/photo_39@14-12-2024_20-39-02.jpg}	2026-02-27 17:48:58.031	2026-02-27 17:48:58.031	\N	default_farnoosh_mashreq	\N
message67	2024-12-16 00:00:00	20:06	123.67	AED	expense	cmm56s17800028ogefz2eqqt0	Carrefour Market (JLT Palladium, Dubai)	کارفور	["CRF Chips Salt 170g - 5.00","CRF Bread 600g - 4.00","Dubai Salted 22g x2 - 2.90","CRF T Roll 4plyx4 - 8.70","Kraft Phil 180g - 11.75","Alain Yogh FF 1kg - 6.99","Norwegian Salmon F - 32.55","CRF Tender 500g - 13.29","Kalleh Lab 500ml - 3.79","Cucumber kg EP - 3.35","Orange Navel - 8.15","Lemon - 1.75","CRF Tomato 700g - 9.95","Apple Royal Gala - 5.00","Banana EP - 2.60","Lettuce Romaine kg - 3.90"]	image	t	{photos/photo_41@16-12-2024_20-06-25.jpg}	2026-02-27 17:48:58.031	2026-02-27 17:48:58.031	\N	default_farnoosh_mashreq	\N
message47	2024-12-01 00:00:00	15:04	0.00	AED	expense	cmm56s17c00058ogea78vq636	Mashreq Neo	statment	Bank statement Oct-Nov 2024, total debits 1,002.45	file	t	{files/Account_Statement_019101544538.pdf}	2026-02-27 17:48:58.031	2026-02-27 20:52:26.302	\N	default_farnoosh_mashreq	\N
message43	2024-11-10 00:00:00	16:39	\N	AED	other	cmm56s17c00058ogea78vq636	\N	AE810330000019101544538	IBAN number reference | Bank account screenshot	text	t	{photos/photo_26@10-11-2024_16-39-05.jpg}	2026-02-27 17:48:58.031	2026-02-28 07:32:37.722	\N	default_farnoosh_mashreq	\N
message44	2024-11-10 00:00:00	16:39	\N	AED	other	cmm56s17c00058ogea78vq636	\N	\N	Bank account screenshot	image	t	{photos/photo_26@10-11-2024_16-39-05.jpg}	2026-02-27 17:48:58.031	2026-02-28 07:32:37.722	message43	default_farnoosh_mashreq	\N
message65	2024-12-14 00:00:00	20:39	11.55	AED	expense	cmm60aoac0000ry015m0ptwvq	Al Ain Water	خرید آب از العین👆	["Al Ain Zero Bottled Drinking Water 5 Gallon - 11.00 + 0.55 VAT"]	image	t	{photos/photo_40@14-12-2024_20-39-52.jpg}	2026-02-27 17:48:58.031	2026-02-28 07:35:51.823	\N	default_farnoosh_mashreq	\N
message66	2024-12-14 00:00:00	20:39	\N	AED	expense	cmm60aoac0000ry015m0ptwvq	\N	خرید آب از العین👆	\N	text	f	{}	2026-02-27 17:48:58.031	2026-02-28 07:35:51.823	message65	default_farnoosh_mashreq	\N
message70	2024-12-16 00:00:00	21:04	15.00	AED	expense	cmm56s17800028ogefz2eqqt0	\N	۱۵ درهم دیپازیت آب از العین👆	Wallet balance used for orders on 16 Dec 2024	text	t	{photos/photo_42@16-12-2024_21-03-42.jpg}	2026-02-27 17:48:58.031	2026-02-28 07:38:50.411	\N	default_farnoosh_mashreq	\N
message69	2024-12-16 00:00:00	21:03	26.55	AED	expense	cmm56s17800028ogefz2eqqt0	Wallet App	\N	Wallet balance used for orders on 16 Dec 2024	image	t	{photos/photo_42@16-12-2024_21-03-42.jpg}	2026-02-27 17:48:58.031	2026-02-28 07:38:50.411	message70	default_farnoosh_mashreq	\N
message731	2025-11-21 00:00:00	09:56	705.00	AED	expense	cmm56s17a00048ogeacrpia4x	Sobha Smart Bill Services	قبضActivation feeSecurity Depositبابتchilled and hot water	["Activation fee (100 AED)","Refundable security deposit (600 AED)","VAT (5 AED)","Chilled and hot water - November bill"]	file	t	{files/SSBS-D-304815.pdf}	2026-02-27 17:48:58.411	2026-02-28 09:17:47.752	message734	default_farnoosh_mashreq	\N
message76	2024-12-24 00:00:00	11:21	24.98	AED	expense	cmm56s17800028ogefz2eqqt0	Carrefour Market (JLT Palladium, Dubai)	کارفور	["CRF Bread 600g - 4.00","Kalleh Lab 500ml - 3.79","KitKat Dark 41.5g - 3.95","M&M's Peanut 45g - 4.95","Parle Marie 34.4g - 3.25","Ulker 175gr - 3.25","Alfrz Med 200g - 1.79"]	image	t	{photos/photo_46@24-12-2024_11-21-55.jpg}	2026-02-27 17:48:58.031	2026-02-27 17:48:58.031	\N	default_farnoosh_mashreq	\N
message77	2024-12-24 00:00:00	11:22	169.05	AED	expense	cmm56s17600018ogeqghk7vfb	Gilaneh Restaurant (Al Maktoum, Deira, Dubai)	گیلانه	["Chelow joojeh bedon ostokhan torsh - 65.00","Chelow joojeh bedon ostokhan zaaferani - 65.00","Mast borani bademjan - 15.00","Cola x2 - 16.00"]	image	t	{photos/photo_47@24-12-2024_11-22-43.jpg}	2026-02-27 17:48:58.031	2026-02-27 17:48:58.031	\N	default_farnoosh_mashreq	\N
message79	2024-12-24 00:00:00	11:24	98.00	AED	expense	cmm56s17900038ogeyynewip3	RTA Hala Taxi (Metro Taxi)	کریم از گیلانه به خونه	\N	image	t	{photos/photo_48@24-12-2024_11-24-04.jpg}	2026-02-27 17:48:58.031	2026-02-27 17:48:58.031	\N	default_farnoosh_mashreq	\N
message82	2024-12-24 00:00:00	11:26	23.00	AED	expense	cmm56s17900038ogeyynewip3	\N	۲۳ درهم تاکسی با ونوس اینادیگه رسید نگرفتم21 December 202410 PM	\N	text	f	{}	2026-02-27 17:48:58.031	2026-02-27 17:48:58.031	\N	default_farnoosh_mashreq	\N
message83	2024-12-24 00:00:00	11:26	62.10	AED	expense	cmm56s17800028ogefz2eqqt0	Spinneys	اسپینیس	\N	image	t	{photos/photo_50@24-12-2024_11-26-49.jpg}	2026-02-27 17:48:58.031	2026-02-27 17:48:58.031	\N	default_farnoosh_mashreq	\N
message87	2024-12-24 00:00:00	11:28	261.00	AED	expense	cmm56s17600018ogeqghk7vfb	Farsi Restaurant	رستوران فارسی	\N	image	t	{photos/photo_51@24-12-2024_11-28-35.jpg}	2026-02-27 17:48:58.031	2026-02-27 17:48:58.031	\N	default_farnoosh_mashreq	\N
message89	2024-12-27 00:00:00	22:21	22.89	AED	expense	cmm56s17800028ogefz2eqqt0	Carrefour Market	کارفور	\N	image	t	{photos/photo_52@27-12-2024_22-21-23.jpg}	2026-02-27 17:48:58.031	2026-02-27 17:48:58.031	\N	default_farnoosh_mashreq	\N
message90	2024-12-27 00:00:00	22:22	46.50	AED	expense	cmm56s17800028ogefz2eqqt0	Fresh Basket LLC	پریل و مایع دستشویی	\N	image	t	{photos/photo_53@27-12-2024_22-22-30.jpg}	2026-02-27 17:48:58.031	2026-02-27 17:48:58.031	\N	default_farnoosh_mashreq	\N
message93	2024-12-27 00:00:00	22:23	86.00	AED	expense	cmm56s17600018ogeqghk7vfb	Subway	\N	\N	image	t	{photos/photo_55@27-12-2024_22-23-23.jpg}	2026-02-27 17:48:58.031	2026-02-27 17:48:58.031	\N	default_farnoosh_mashreq	\N
message94	2024-12-27 00:00:00	22:23	59.00	AED	expense	cmm56s17g00088oge05l6cktv	Centrepoint	پیرهن سبز سینا از دیره	\N	image	t	{photos/photo_56@27-12-2024_22-23-33.jpg}	2026-02-27 17:48:58.031	2026-02-27 17:48:58.031	\N	default_farnoosh_mashreq	\N
message95	2024-12-27 00:00:00	22:24	9.50	AED	expense	cmm56s17800028ogefz2eqqt0	Spinneys	اسپینیس	\N	image	t	{photos/photo_57@27-12-2024_22-24-30.jpg}	2026-02-27 17:48:58.031	2026-02-27 17:48:58.031	\N	default_farnoosh_mashreq	\N
message97	2024-12-27 00:00:00	22:26	145.00	AED	expense	cmm56s17600018ogeqghk7vfb	McGettigan's	تولد فرنوش	\N	image	t	{photos/photo_58@27-12-2024_22-26-06.jpg}	2026-02-27 17:48:58.031	2026-02-27 17:48:58.031	\N	default_farnoosh_mashreq	\N
message98	2024-12-27 00:00:00	22:26	7.79	AED	expense	cmm56s17800028ogefz2eqqt0	Carrefour Market	کارفور	\N	image	t	{photos/photo_59@27-12-2024_22-26-15.jpg}	2026-02-27 17:48:58.031	2026-02-27 17:48:58.031	\N	default_farnoosh_mashreq	\N
message99	2025-01-02 00:00:00	21:04	80.00	AED	expense	cmm56s17600018ogeqghk7vfb	Vinci Restaurant	بستنی امارات مال	\N	image	t	{photos/photo_60@02-01-2025_21-04-07.jpg}	2026-02-27 17:48:58.031	2026-02-27 17:48:58.031	\N	default_farnoosh_mashreq	\N
message100	2025-01-02 00:00:00	21:04	220.56	AED	expense	cmm56s17800028ogefz2eqqt0	Carrefour	کارفور امارات مال	\N	image	t	{photos/photo_61@02-01-2025_21-04-17.jpg}	2026-02-27 17:48:58.031	2026-02-27 17:48:58.031	\N	default_farnoosh_mashreq	\N
message102	2025-01-02 00:00:00	21:07	1356.41	AED	expense	cmm56s17f00078oge3yf8pp6g	platinumlist.net	\N	\N	image	t	{photos/photo_62@02-01-2025_21-07-38.jpg}	2026-02-27 17:48:58.031	2026-02-27 17:48:58.031	\N	default_farnoosh_mashreq	\N
message104	2025-01-02 00:00:00	21:08	156.41	AED	expense	cmm56s17f00078oge3yf8pp6g	PLP Events	\N	Ebi concert add-ons: Refund Guarantee + WhatsApp Reminder	file	t	{files/26411481-tax-invoice2.pdf}	2026-02-27 17:48:58.031	2026-02-27 17:48:58.031	\N	default_farnoosh_mashreq	\N
message107	2025-01-02 00:00:00	21:10	68.00	AED	expense	cmm56s17600018ogeqghk7vfb	\N	۶۸ درهم مک دونالد خوردیم رسیدشو گم کردم31 December 202410:58 PM	\N	text	f	{}	2026-02-27 17:48:58.031	2026-02-27 17:48:58.031	\N	default_farnoosh_mashreq	\N
message74	2024-12-19 00:00:00	10:23	15.00	AED	expense	cmm60aoac0000ry015m0ptwvq	Al Ain Food And Bevera	\N	\N	image	t	{photos/photo_44@19-12-2024_10-23-33.jpg}	2026-02-27 17:48:58.031	2026-02-28 07:39:51.799	\N	default_farnoosh_mashreq	\N
message75	2024-12-19 00:00:00	10:25	12.00	AED	expense	cmm60aoac0000ry015m0ptwvq	Al Ain Food And Bevera	خرید گالن دوم العین	\N	image	t	{photos/photo_45@19-12-2024_10-25-56.jpg}	2026-02-27 17:48:58.031	2026-02-28 07:39:59.73	\N	default_farnoosh_mashreq	\N
message81	2024-12-24 00:00:00	11:25	\N	AED	expense	cmm56s17a00048ogeacrpia4x	\N	خرید اینترنت دو سینا	\N	text	f	{}	2026-02-27 17:48:58.031	2026-02-28 07:40:41.815	message80	default_farnoosh_mashreq	\N
message85	2024-12-24 00:00:00	11:27	320.00	AED	expense	cmm56s17f00078oge3yf8pp6g	Ticketmaster	وینترسیتی با ونوس ایناWinter city	4x General Admission Winter City at Al Wasl Plaza	file	t	{"files/Ticketmaster - My Account.pdf"}	2026-02-27 17:48:58.031	2026-02-28 07:41:56.568	\N	default_farnoosh_mashreq	\N
message86	2024-12-24 00:00:00	11:28	\N	AED	expense	cmm56s17f00078oge3yf8pp6g	\N	وینترسیتی با ونوس ایناWinter city	\N	text	f	{}	2026-02-27 17:48:58.031	2026-02-28 07:41:56.568	message85	default_farnoosh_mashreq	\N
message103	2025-01-02 00:00:00	21:08	1200.00	AED	expense	cmm56s17f00078oge3yf8pp6g	PLP Events	کنسرت ابی👆	2x Platinum tickets Ebi concert, Saadiyat Island | Reference to Ebi concert invoices above (messages 103-104)	file	t	{files/26411481-tax-invoice1.pdf}	2026-02-27 17:48:58.031	2026-02-28 07:56:43.666	\N	default_farnoosh_mashreq	\N
message92	2024-12-27 00:00:00	22:23	\N	AED	expense	cmm56s17800028ogefz2eqqt0	\N	گالن آب العین	\N	text	f	{}	2026-02-27 17:48:58.031	2026-02-28 07:42:17.411	message91	default_farnoosh_mashreq	\N
message91	2024-12-27 00:00:00	22:22	12.00	AED	expense	cmm60aoac0000ry015m0ptwvq	Al Ain Food And Bevera	گالن آب العین	\N	image	t	{photos/photo_54@27-12-2024_22-22-39.jpg}	2026-02-27 17:48:58.031	2026-02-28 07:42:25.557	\N	default_farnoosh_mashreq	\N
message105	2025-01-02 00:00:00	21:08	\N	AED	expense	cmm56s17f00078oge3yf8pp6g	\N	کنسرت ابی👆	Reference to Ebi concert invoices above (messages 103-104)	text	f	{}	2026-02-27 17:48:58.031	2026-02-28 07:56:43.666	message103	default_farnoosh_mashreq	\N
message108	2025-01-02 00:00:00	21:11	4.00	AED	expense	cmm56s17800028ogefz2eqqt0	\N	۴ درهم سینا لیمو خریده رسیدشو نگرفته1st January 4:00 PM	\N	text	f	{}	2026-02-27 17:48:58.031	2026-02-28 07:58:01.13	\N	default_farnoosh_mashreq	\N
message106	2025-01-02 00:00:00	21:09	200.00	AED	expense	cmm56s17900038ogeyynewip3	Mashreq Neo	ترنسفر کنسرت ابی	Transfer to Fatemeh Mohseniazgha for Ebi concert	file	t	{files/WWM30122458180.pdf}	2026-02-27 17:48:58.031	2026-02-28 08:01:52.712	\N	default_farnoosh_mashreq	\N
message109	2025-01-02 00:00:00	21:12	20.75	AED	expense	cmm56s17800028ogefz2eqqt0	Zoom Market (ENOC)	نان کیت کت و بستنی پاندا	\N	image	t	{photos/photo_63@02-01-2025_21-12-17.jpg}	2026-02-27 17:48:58.031	2026-02-27 17:48:58.031	\N	default_farnoosh_mashreq	\N
message112	2025-01-07 00:00:00	13:29	33.50	AED	expense	cmm56s17800028ogefz2eqqt0	Gift Village	گیفت ویلج	\N	image	t	{photos/photo_65@07-01-2025_13-29-29.jpg}	2026-02-27 17:48:58.031	2026-02-27 17:48:58.031	\N	default_farnoosh_mashreq	\N
message114	2025-01-07 00:00:00	13:30	148.00	AED	expense	cmm56s17g00088oge05l6cktv	LC Waikiki	LC Waikiki	\N	image	t	{photos/photo_66@07-01-2025_13-30-20.jpg}	2026-02-27 17:48:58.031	2026-02-27 17:48:58.031	\N	default_farnoosh_mashreq	\N
message116	2025-01-07 00:00:00	13:31	89.00	AED	expense	cmm56s17600018ogeqghk7vfb	\N	۸۹ درهم کنسرت ابی پیتزا خوردیم فاکتورشو ازمون گرفتن4th January 20256:30 PM	\N	text	f	{}	2026-02-27 17:48:58.031	2026-02-27 17:48:58.031	\N	default_farnoosh_mashreq	\N
message117	2025-01-07 00:00:00	13:33	55.00	AED	expense	cmm56s17600018ogeqghk7vfb	Aptitude	نوشیدنی بین کنسرت ابی	\N	image	t	{photos/photo_67@07-01-2025_13-33-12.jpg}	2026-02-27 17:48:58.031	2026-02-27 17:48:58.031	\N	default_farnoosh_mashreq	\N
message118	2025-01-07 00:00:00	13:33	17.05	AED	expense	cmm56s17j000a8ogezifv1oi1	Life Pharmacy	قرص سرماخوردگی	\N	image	t	{photos/photo_68@07-01-2025_13-33-36.jpg}	2026-02-27 17:48:58.031	2026-02-27 17:48:58.031	\N	default_farnoosh_mashreq	\N
message120	2025-01-07 00:00:00	13:34	23.72	AED	expense	cmm56s17800028ogefz2eqqt0	Carrefour Market (JLT Palladium, Dubai)	کارفور	["Mai Dubai DW 5L - 5.25","Kalleh Lab 500ml - 3.79","Orange Navel - 5.55","Lemon - 1.35","CRF Eggs White x6 - 5.49","Vetal Zabadi 170g - 2.29"]	image	t	{photos/photo_69@07-01-2025_13-34-14.jpg}	2026-02-27 17:48:58.031	2026-02-27 17:48:58.031	\N	default_farnoosh_mashreq	\N
message121	2025-01-07 00:00:00	13:34	38.60	AED	expense	cmm56s17800028ogefz2eqqt0	Carrefour Market (JLT Palladium, Dubai)	کارفور	["Bananas Premium - 5.40","Alfrz Med 200g - 1.79","Deemah Date 150gr - 3.29","Lemon Pep Chic 75g - 11.85","Frozen Bag - 6.79","CRF Spread PL 150g - 7.49","Al Ain Milk 250ml - 1.99"]	image	t	{photos/photo_70@07-01-2025_13-34-48.jpg}	2026-02-27 17:48:58.031	2026-02-27 17:48:58.031	\N	default_farnoosh_mashreq	\N
message122	2025-01-07 00:00:00	13:50	3.00	AED	expense	cmm56s17800028ogefz2eqqt0	\N	۳ درهم خرید سیب زمینی از Nour Fresh Mart7 January 202511:41 AM	\N	text	f	{}	2026-02-27 17:48:58.031	2026-02-27 17:48:58.031	\N	default_farnoosh_mashreq	\N
message123	2025-01-07 00:00:00	21:33	5.00	AED	expense	cmm56s17800028ogefz2eqqt0	\N	۵ درهم خرید گالن آب کوچک از Nour Fresh Mart7 January 202507:49 PM	\N	text	f	{}	2026-02-27 17:48:58.031	2026-02-27 17:48:58.031	\N	default_farnoosh_mashreq	\N
message124	2025-02-17 00:00:00	21:45	1492.94	AED	expense	cmm56s17e00068ogeybi889nb	Airbnb	اجاره خونه از airbnb	3 nights in Dubai Feb 24-27 2025	file	t	{files/RC9MAFNW5B.pdf}	2026-02-27 17:48:58.031	2026-02-27 17:48:58.031	\N	default_farnoosh_mashreq	\N
message129	2025-03-16 00:00:00	11:17	55.76	AED	expense	cmm56s17800028ogefz2eqqt0	Fine Mart Supermarket L.L (Dubai Marina)	فاین مارت	["Al Ain Drinking Water - 5.50","Potato - 2.71","Apple Green - 9.33","Cucumber - 2.94","Royal Khaleej White - 6.75","Barbican Malt Bevera - 4.00","Al Ain Low Fat Yogh - 2.00","Almarai Feta Tetra - 6.75","Banana - 5.49","Watermelon - 10.29"]	image	t	{photos/photo_71@16-03-2025_11-17-45.jpg}	2026-02-27 17:48:58.031	2026-02-27 17:48:58.031	\N	default_farnoosh_mashreq	\N
message130	2025-03-16 00:00:00	11:22	25.50	AED	expense	cmm56s17900038ogeyynewip3	\N	۲۵.۵۰ درهم تاکسی گرفتیم رسیدشو نگرفتیم24th February 08:08 PM	\N	text	f	{}	2026-02-27 17:48:58.031	2026-02-27 17:48:58.031	\N	default_farnoosh_mashreq	\N
message131	2025-03-16 00:00:00	11:22	27.50	AED	expense	cmm56s17900038ogeyynewip3	\N	۲۷.۵۰ درهم تاکسی گرفتیم رسیدشو نگرفتیم25th February 07:09 PM	\N	text	f	{}	2026-02-27 17:48:58.031	2026-02-27 17:48:58.031	\N	default_farnoosh_mashreq	\N
message132	2025-03-16 00:00:00	11:23	16.25	AED	expense	cmm56s17600018ogeqghk7vfb	Carrefour Market (JLT Palladium, Dubai)	کارفور	["Samosa Vegetables - 5.00","R Chick Skewer 75g - 11.25"]	image	t	{photos/photo_72@16-03-2025_11-23-04.jpg}	2026-02-27 17:48:58.031	2026-02-27 17:48:58.031	\N	default_farnoosh_mashreq	\N
cmm6fdwde001q8o1s69bm2p8s	2025-05-22 00:00:00	23:00	367.00	USD	expense	cmm56s17l000b8ogen8sv9jjw	Express VPN	۹۹.۹۵ دلار بابت Express VPN از حساب سینا کم شده	\N	\N	f	{}	2026-02-28 14:37:41.282	2026-02-28 15:28:59.818	\N	cmm6fbnk800008o9w89ze2ol6	\N
message138	2025-03-16 00:00:00	11:28	59.38	AED	expense	cmm56s17800028ogefz2eqqt0	Carrefour Market (JLT Palladium, Dubai)	کارفور	["Chicken Pasta KG - 6.50","Kraft Phil 280g - 15.99","Mogu Mogu Grape 320ml - 5.49","Bananas Premium - 8.90","R Chick Skewer 75g - 11.25","R Chick Skewer 75g - 11.25"]	image	t	{photos/photo_75@16-03-2025_11-28-14.jpg}	2026-02-27 17:48:58.128	2026-02-27 17:48:58.128	\N	default_farnoosh_mashreq	\N
message139	2025-03-16 00:00:00	11:29	72.72	AED	expense	cmm56s17900038ogeyynewip3	Uber	اوبر از JLT به Sobha	\N	image	t	{photos/photo_76@16-03-2025_11-29-06.jpg}	2026-02-27 17:48:58.128	2026-02-27 17:48:58.128	\N	default_farnoosh_mashreq	\N
message140	2025-03-16 00:00:00	11:29	247.05	AED	expense	cmm56s17800028ogefz2eqqt0	Geant Express (One Park Avenue, Al Merkadh, Dubai)	Geant	["Lusine Multi Gra - 0.10","Al Ain Drinking - various","Loaf Bread Multi - various","Marinated Cheese - various","Halloumi Halloum C - various","EP Capsicum Mix - various","Sprite Soft Drink - 8.00","Heinz Tomato - various","Potato Egypt KG - various","Alyoum Chicken B - various","Lime Seedless V1 - various","Carrot Austria LG - various","Cucumber Med KG - various","Mushroom White O - various","Banana Virgen GLO - various","Pearl Butternut - various","Almarai Chkn KG - various","Quaker Triple Ch - various","Al Ain Whole Egg - various","Balaah Fillet No - various","Lettuce Romaine - various","Plastic Bag - various"]	image	t	{photos/photo_77@16-03-2025_11-29-41.jpg}	2026-02-27 17:48:58.128	2026-02-27 17:48:58.128	\N	default_farnoosh_mashreq	\N
message146	2025-03-16 00:00:00	11:43	5.90	AED	expense	cmm56s17f00078oge3yf8pp6g	PLP Events	\N	Max Amini concert ticketing agent fee	file	t	{files/27753132-tax-invoice2.pdf}	2026-02-27 17:48:58.128	2026-02-27 17:48:58.128	\N	default_farnoosh_mashreq	\N
message110	2025-01-02 00:00:00	21:12	11.00	AED	expense	cmm60aoac0000ry015m0ptwvq	Al Ain Food And Bevera	گالن از العین👆	\N	image	t	{photos/photo_64@02-01-2025_21-12-24.jpg}	2026-02-27 17:48:58.031	2026-02-28 07:58:33.296	\N	default_farnoosh_mashreq	\N
message111	2025-01-02 00:00:00	21:12	\N	AED	expense	cmm60aoac0000ry015m0ptwvq	\N	گالن از العین👆	\N	text	f	{}	2026-02-27 17:48:58.031	2026-02-28 07:58:33.296	message110	default_farnoosh_mashreq	\N
message142	2025-03-16 00:00:00	11:32	39.00	AED	expense	cmm5cqzf10001pw01d9pekwf0	\N	۳۹ درهم سه راهی گرفتیم رسیدشو نگرفتیم28th February 02:38 PM	\N	text	f	{}	2026-02-27 17:48:58.128	2026-02-28 08:03:21.428	\N	default_farnoosh_mashreq	\N
message143	2025-03-16 00:00:00	11:33	50.00	AED	expense	cmm60aoac0000ry015m0ptwvq	Al Ain Food And Bevera	شارژ العین	\N	image	t	{photos/photo_78@16-03-2025_11-33-32.jpg}	2026-02-27 17:48:58.128	2026-02-28 08:03:31.137	\N	default_farnoosh_mashreq	\N
message137	2025-03-16 00:00:00	11:27	132.00	AED	expense	cmm56s17600018ogeqghk7vfb	Talabat (Iran Zamin)	رستوران ایران زمین از Talabat	["Joojeh Kebab Masti Sandwich - 71.00","Chicken Schnitzel Sandwich - 83.00","Discount - -30.80","Delivery fee - 4.90","Service fee - 3.90"]	image	t	{photos/photo_74@16-03-2025_11-27-27.jpg,photos/photo_73@16-03-2025_11-27-27.jpg}	2026-02-27 17:48:58.128	2026-02-28 08:04:55.418	\N	default_farnoosh_mashreq	\N
message147	2025-03-16 00:00:00	11:43	590.00	AED	expense	cmm56s17f00078oge3yf8pp6g	PLP Events / Tar Events	Max Aminiمکس امینی	2x Bronze tickets Max Amini at Dubai Opera	file	t	{files/27753132-tax-invoice1.pdf}	2026-02-27 17:48:58.128	2026-02-27 17:48:58.128	\N	default_farnoosh_mashreq	\N
cmm6fdwcp00088o1snxc8aosd	2025-04-13 00:00:00	12:59	9000.00	AED	transfer	cmm56s17i00098oge2xb5or4t	\N	کارت به کارت سینا به فرنوش\nمبلغ ۹۰۰۰ درهم\nبابت پاس شدن اولین چک‌ خونه + دیپازیت	\N	file	t	{media-sina/files/MWM2603251930133.PDF}	2026-02-28 14:37:41.258	2026-02-28 14:37:41.258	\N	cmm6fbnk800008o9w89ze2ol6	\N
message150	2025-03-16 00:00:00	11:47	123.85	AED	expense	cmm56s17800028ogefz2eqqt0	Geant Express (One Park Avenue, Al Merkadh, Dubai)	Geant	["Cheesecake Blueb - 12.75","BIC J5 Mini Ligh - 2.75","Apple Green Serb - 7.62","Fresh Chicken Br - 19.20","Single Rose Per - 10.00","Jenan Large Whit - 13.80","Banana Chiquita - 5.88","Broccoli Iran KG - 3.71","Peach Yellow Fle - 12.78","Cucumber UAE KG - 2.99","Orange Valencia - 5.59","Protein Bread PC - 6.90","Selpak Toilet Ti - 11.95","Mushroom White O - 7.95"]	image	t	{photos/photo_82@16-03-2025_11-47-06.jpg}	2026-02-27 17:48:58.128	2026-02-27 17:48:58.128	\N	default_farnoosh_mashreq	\N
message152	2025-03-16 00:00:00	11:48	5000.00	AED	income	cmm56s17000008ogezghgfclk	Mashreq Bank ATM (Riqa Branch, Dubai)	واریز به حساب از طریق دستگاه ATM	\N	image	t	{photos/photo_83@16-03-2025_11-48-06.jpg}	2026-02-27 17:48:58.128	2026-02-27 17:48:58.128	\N	default_farnoosh_mashreq	\N
message153	2025-03-16 00:00:00	11:51	11.40	AED	expense	cmm56s17800028ogefz2eqqt0	\N	۱۱.۴۰ درهم سینا از سوپرمارکت BoardWalk خرید کرده رسیدشو نگرفته5th March 08:28 AM	\N	text	f	{}	2026-02-27 17:48:58.128	2026-02-27 17:48:58.128	\N	default_farnoosh_mashreq	\N
message154	2025-03-16 00:00:00	11:51	8.95	AED	expense	cmm56s17800028ogefz2eqqt0	\N	۸.۹۵ درهم سینا از سوپرمارکت BoardWalk خرید کرده رسیدشو پایینتر گذاشتم5th March 08:32 AM	\N	text	f	{}	2026-02-27 17:48:58.128	2026-02-27 17:48:58.128	\N	default_farnoosh_mashreq	\N
message155	2025-03-16 00:00:00	11:52	115.46	AED	expense	cmm56s17800028ogefz2eqqt0	Geant Express (One Park Avenue, Al Merkadh, Dubai)	Geant	["Nectarine Yellow - 12.70","Fresh Mix Herbs - 1.00","Mandarine Pakist - 4.32","Onion Red India - 2.61","Harvest Tomato - 8.28","Celery Stick 300 - 3.47","Lemon Egypt KG - 8.92","Banana Chiquita - 1.12","Almarai Yoghurt - 30.58","Salmon Fillet No - 12.75","Farm Fresh Ch Ch - 9.50","American Garden - 7.20","Almarai Fresh La - various","Basil Pot - 3.05"]	image	t	{photos/photo_84@16-03-2025_11-52-08.jpg}	2026-02-27 17:48:58.128	2026-02-27 17:48:58.128	\N	default_farnoosh_mashreq	\N
message157	2025-03-16 00:00:00	11:57	28.75	AED	expense	cmm56s17800028ogefz2eqqt0	\N	۲۸.۷۵ درهم سینا از سوپرمارکت Spinneys خرید کرده رسیدشو نگرفته6th March 07:44 PM	\N	text	f	{}	2026-02-27 17:48:58.128	2026-02-27 17:48:58.128	\N	default_farnoosh_mashreq	\N
message158	2025-03-16 00:00:00	11:57	36.15	AED	expense	cmm56s17800028ogefz2eqqt0	Geant Express (One Park Avenue, Al Merkadh, Dubai)	Geant	["Mushroom White O - 7.50","Baskin Robbins V - 9.95","Barakat Strawber - 5.00","Haribo Happy Che - 5.95","MMs Chocolate Pe - 5.20","Cheetos Flamin H - 2.65"]	image	t	{photos/photo_85@16-03-2025_11-57-14.jpg}	2026-02-27 17:48:58.128	2026-02-27 17:48:58.128	\N	default_farnoosh_mashreq	\N
message160	2025-03-16 00:00:00	12:00	110.73	AED	expense	cmm56s17800028ogefz2eqqt0	Geant Express (One Park Avenue, Al Merkadh, Dubai)	Geant	["Lazah Cut Green - 5.50","Onion Red India - 2.42","Potato Egypt KG - 4.01","Pure Harvest Tom - 7.31","Apple Green Serb - 10.53","Banana Chiquita - 8.32","Bekind Whole Gra - 19.10","Lux Hand Wash Ve - 24.10","Peach Yellow Fle - 20.78","Lusine Brown Sw - 5.50","Eggplant Premium - 3.18"]	image	t	{photos/photo_86@16-03-2025_12-00-03.jpg}	2026-02-27 17:48:58.128	2026-02-27 17:48:58.128	\N	default_farnoosh_mashreq	\N
message162	2025-03-16 00:00:00	12:01	157.52	AED	expense	cmm56s17f00078oge3yf8pp6g	Dubai Safari Park	سافاری پارک	["Safari Park Pass WT (Adult) x4 - 307.52","Ramadan Offer 50% discount - -150.00"]	image	t	{photos/photo_87@16-03-2025_12-01-32.jpg}	2026-02-27 17:48:58.128	2026-02-27 17:48:58.128	\N	default_farnoosh_mashreq	\N
message163	2025-03-16 00:00:00	12:03	105.00	AED	expense	cmm56s17600018ogeqghk7vfb	\N	۱۰۵ درهم تو سافاری پارک یخ در بهشت و بستنی خوردیم رسیدشو نگرفتیم8th March 01:22 PM	\N	text	f	{}	2026-02-27 17:48:58.128	2026-02-27 17:48:58.128	\N	default_farnoosh_mashreq	\N
message164	2025-03-16 00:00:00	12:04	3.00	AED	expense	cmm56s17800028ogefz2eqqt0	\N	۳ درهم تو سافاری پارک از دستگاه آب گرفتیم رسید نداد8th March 03:41 PM	\N	text	f	{}	2026-02-27 17:48:58.128	2026-02-27 17:48:58.128	\N	default_farnoosh_mashreq	\N
message165	2025-03-16 00:00:00	12:04	3.00	AED	expense	cmm56s17800028ogefz2eqqt0	\N	۳ درهم تو سافاری پارک از دستگاه آب گرفتیم رسید نداد8th March 03:42 PM	\N	text	f	{}	2026-02-27 17:48:58.128	2026-02-27 17:48:58.128	\N	default_farnoosh_mashreq	\N
message166	2025-03-16 00:00:00	12:04	327.00	AED	expense	cmm56s17600018ogeqghk7vfb	Kahkeshan Restaurant (Iranian)	گیلانه	["Chelow Kabab Kobideh x2 - 120","Chelow Kabab Torsh x1 - 69","Chelow Kabab Joojeh x1 - 55","Shirazi Salad x1 - 15","Zeytoon Parvardeh x1 - 12","Doogh x1 - 12","Doogh x1 - 12","Coca Cola x1 - 8","Coca Cola x1 - 8"]	image	t	{photos/photo_88@16-03-2025_12-04-47.jpg}	2026-02-27 17:48:58.128	2026-02-27 17:48:58.128	\N	default_farnoosh_mashreq	\N
message168	2025-03-16 00:00:00	12:07	38.50	AED	expense	cmm56s17900038ogeyynewip3	\N	۳۸.۵۰ درهم تاکسی از مترو دبی مال به سبحا گرفتیم8th March 08:49 PM	\N	text	f	{}	2026-02-27 17:48:58.128	2026-02-27 17:48:58.128	\N	default_farnoosh_mashreq	\N
message169	2025-03-16 00:00:00	12:10	33.84	AED	expense	cmm56s17600018ogeqghk7vfb	\N	۳۳.۸۴ درهم تو شارجه از Spinneys ناهار گرفتیم11th March 02:31 PM	\N	text	f	{}	2026-02-27 17:48:58.128	2026-02-27 17:48:58.128	\N	default_farnoosh_mashreq	\N
message170	2025-03-16 00:00:00	12:11	1.25	AED	expense	cmm56s17800028ogefz2eqqt0	\N	۱.۲۵ درهم آب خریدیم12th March 11:17 PM	\N	text	f	{}	2026-02-27 17:48:58.128	2026-02-27 17:48:58.128	\N	default_farnoosh_mashreq	\N
message171	2025-03-16 00:00:00	12:18	129.61	AED	expense	cmm56s17800028ogefz2eqqt0	Geant Express - One Park Avenue	Geant	["Lemon Egypt","Lettuce Romaine","Clementine Turkey","Apple Green Fran","Capsicum Green","Fresh Chicken Breast","Garlic China","Organic Cucumber","Broccoli Iran","Haribo Happy Cherry","Farm Fresh Eggs","Kiwi Green Italy","Watermelon Iran","Orange Valencia","Bandar Dates","Almarai Yoghurt"]	image	t	{photos/photo_89@16-03-2025_12-18-02.jpg}	2026-02-27 17:48:58.128	2026-02-27 17:48:58.128	\N	default_farnoosh_mashreq	\N
message173	2025-03-16 00:00:00	12:20	40.45	AED	expense	cmm56s17800028ogefz2eqqt0	Choithrams Sobha Hartland	\N	["Supervalu Pasta Sauce Original 460g","Holsten Mojito 330ml","Holsten Non Alcoholic Beer Pomegranate B 330ml","Holsten Namb Black Grape Flvr 330ml"]	image	t	{photos/photo_90@16-03-2025_12-20-10.jpg}	2026-02-27 17:48:58.128	2026-02-27 17:48:58.128	\N	default_farnoosh_mashreq	\N
message175	2025-03-16 00:00:00	12:21	175.00	AED	expense	cmm56s17600018ogeqghk7vfb	Rivas	ریواس	["Cutlet Sandwich (40.00)","Ash Reshteh (30.00)","Kuku Sabzi Sandwich (40.00)","Shole Zard (35.00)","Faloodeh (22.00)","Delivery Fee (8.00)"]	image	t	{photos/photo_91@16-03-2025_12-21-01.jpg}	2026-02-27 17:48:58.128	2026-02-27 17:48:58.128	\N	default_farnoosh_mashreq	\N
message177	2025-03-16 00:00:00	12:23	17.10	AED	expense	cmm56s17800028ogefz2eqqt0	\N	۱۷.۱۰ درهم عسل و نان از Geant خریدیم رسیدشو نگرفتیم14th March 02:31 PM	\N	text	f	{}	2026-02-27 17:48:58.128	2026-02-27 17:48:58.128	\N	default_farnoosh_mashreq	\N
message167	2025-03-16 00:00:00	12:06	18.38	AED	expense	cmm56s17600018ogeqghk7vfb	\N	۱۸.۳۸ درهم از Iranian Sweets زولبیا بامیه گرفتیم رسیدشو نگرفتیم8th March 08:00 PM	\N	text	f	{}	2026-02-27 17:48:58.128	2026-02-28 08:08:43.876	\N	default_farnoosh_mashreq	\N
message178	2025-03-16 00:00:00	12:23	8.95	AED	expense	cmm56s17800028ogefz2eqqt0	Boardwalk Supermarket BR	\N	["Sanita Cooking & Baking Paper"]	image	t	{photos/photo_92@16-03-2025_12-23-19.jpg}	2026-02-27 17:48:58.128	2026-02-27 17:48:58.128	\N	default_farnoosh_mashreq	\N
message179	2025-03-16 00:00:00	15:22	1523.00	AED	expense	cmm56s17f00078oge3yf8pp6g	Coca-Cola Arena	کنسرت معین	2x Diamond Tier Moein concert tickets	file	t	{files/order_362516_Invoice.pdf}	2026-02-27 17:48:58.128	2026-02-27 17:48:58.128	\N	default_farnoosh_mashreq	\N
message184	2025-03-23 00:00:00	11:46	50.40	AED	expense	cmm56s17900038ogeyynewip3	Careem (Taxi)	تاکسی از Sobha‌ به JVC با Z	\N	image	t	{photos/photo_93@23-03-2025_11-46-31.jpg}	2026-02-27 17:48:58.128	2026-02-27 17:48:58.128	\N	default_farnoosh_mashreq	\N
message734	2025-11-21 00:00:00	09:57	793.59	AED	expense	cmm56s17a00048ogeacrpia4x	Sobha Smart Bill Services LLC	رسید پرداختActivation feeSecurity DepositOctober billبابتchilled and hot water | قبضActivation feeSecurity Depositبابتchilled and hot water | قبضOctoberبابت chilled and hot water | امضای قرارداد بین من و sobhaبابتChilled and hot water	["Payment for activation fee, security deposit, and October bill for chilled and hot water"] | ["Activation fee (100 AED)","Refundable security deposit (600 AED)","VAT (5 AED)","Chilled and hot water - November bill"] | ["Thermal energy charges (62.34 AED)","Billing service fee (26.25 AED)","Previous bill balance (705.00 AED)","Chilled and hot water - October bill"] | ["Chilled water billing service agreement - security deposit for unit RB-509 Sobha Creek Vistas Reserve"]	file	t	{files/MLC1911251290105.PDF,files/SSBS-D-304815.pdf,files/SSBS-D-307313.pdf,files/Documents_for_your_DocuSign_Signature.pdf}	2026-02-27 17:48:58.411	2026-02-28 09:18:32.712	\N	default_farnoosh_mashreq	\N
message191	2025-03-23 00:00:00	11:51	32.90	AED	expense	cmm56s17900038ogeyynewip3	Careem (Taxi)	تاکسی از Fresh Bazaar به خونه با Z	\N	image	t	{photos/photo_97@23-03-2025_11-51-40.jpg}	2026-02-27 17:48:58.128	2026-02-27 17:48:58.128	\N	default_farnoosh_mashreq	\N
message192	2025-03-23 00:00:00	11:54	22.00	AED	expense	cmm56s17900038ogeyynewip3	Careem / Hala Taxi	تاکسی از Sobha به عزیزی	\N	image	t	{photos/photo_98@23-03-2025_11-54-39.jpg}	2026-02-27 17:48:58.128	2026-02-27 17:48:58.128	\N	default_farnoosh_mashreq	\N
cmm6fdwcr000c8o1s560kgf83	2025-03-29 00:00:00	09:40	5.49	AED	expense	cmm56s17800028ogefz2eqqt0	Geant	سینا ۵.۴۹ درهم از سوپرمارکت Geant نون خرید کرده رسیدشو نگرفته	\N	\N	f	{}	2026-02-28 14:37:41.26	2026-02-28 14:37:41.26	\N	cmm6fbnk800008o9w89ze2ol6	\N
message195	2025-03-23 00:00:00	11:58	26.50	AED	expense	cmm56s17800028ogefz2eqqt0	Spinneys Sobha Hartland	خرید ساندویچ از اسپینیس	\N	image	t	{photos/photo_101@23-03-2025_11-58-30.jpg}	2026-02-27 17:48:58.128	2026-02-27 17:48:58.128	\N	default_farnoosh_mashreq	\N
message198	2025-03-23 00:00:00	12:06	20.22	AED	expense	cmm56s17800028ogefz2eqqt0	Gmg Consumer Llc (Geant Express)	Geant	\N	image	t	{photos/photo_102@23-03-2025_12-06-59.jpg}	2026-02-27 17:48:58.128	2026-02-27 17:48:58.128	\N	default_farnoosh_mashreq	\N
message199	2025-03-23 00:00:00	12:07	5.00	AED	expense	cmm56s17800028ogefz2eqqt0	Fullcart Fresh Supermarket	خرید نون باگت	\N	image	t	{photos/photo_103@23-03-2025_12-07-29.jpg}	2026-02-27 17:48:58.128	2026-02-27 17:48:58.128	\N	default_farnoosh_mashreq	\N
message206	2025-03-24 00:00:00	17:42	2000.00	AED	income	cmm56s17000008ogezghgfclk	Mashreq ATM	واریز به حساب سینا از طریق دستگاه ATM	["Cash deposit AED 1000 x 2"]	image	t	{photos/photo_108@24-03-2025_17-42-49.jpg}	2026-02-27 17:48:58.128	2026-02-28 15:40:18.466	\N	cmm6fbnk800008o9w89ze2ol6	\N
message201	2025-03-23 00:00:00	12:08	44.82	AED	expense	cmm56s17800028ogefz2eqqt0	Geant Express - One Park Avenue	Geant	["Mandarine Turkey","Orange Valencia","Banana Chiquita","Lettuce Romaine","Driscolls Blackberries","Loaf Protein"]	image	t	{photos/photo_105@23-03-2025_12-08-19.jpg}	2026-02-27 17:48:58.128	2026-02-27 17:48:58.128	\N	default_farnoosh_mashreq	\N
message203	2025-03-24 00:00:00	17:40	48.50	AED	expense	cmm56s17900038ogeyynewip3	Careem / Hala Taxi	کریم از خونه به مرکز Ejari	\N	image	t	{photos/photo_106@24-03-2025_17-40-45.jpg}	2026-02-27 17:48:58.128	2026-02-27 17:48:58.128	\N	default_farnoosh_mashreq	\N
message205	2025-03-24 00:00:00	17:42	10000.00	AED	income	cmm56s17000008ogezghgfclk	Mashreq ATM	واریز به حساب از طریق دستگاه ATM	["Cash deposit AED 1000 x 10"]	image	t	{photos/photo_107@24-03-2025_17-42-43.jpg}	2026-02-27 17:48:58.128	2026-02-27 17:48:58.128	\N	default_farnoosh_mashreq	\N
message207	2025-03-24 00:00:00	17:43	20.62	AED	expense	cmm56s17900038ogeyynewip3	Careem	تاکسی از مرکز ایجاری به خونه با Z	["Taxi ride (Tesla Model 3, Relax mode, promo TAXI25 applied)"]	image	t	{photos/photo_109@24-03-2025_17-43-57.jpg}	2026-02-27 17:48:58.128	2026-02-27 17:48:58.128	\N	default_farnoosh_mashreq	\N
message208	2025-03-25 00:00:00	14:01	206.55	AED	expense	cmm56s17800028ogefz2eqqt0	Geant Express (One Park Avenue, Sobha Hartland)	Geant	["Highdown White D (8.10)","Lusine Multi Grain (10.75)","Bakhor Dates (3.50)","Sprite Soft Drink (5.86)","Haribo Jelly Gold (2.45)","Cheetos Crunchy C (8.45)","Lurpak Butter SR (11.60)","Pizza Cream Crees (28.70)","Bayara Walnut PR (15.85)","Banana Chiquita (1.50)","Orange Navel Egypt (7.28)","Pomegranate (14.48)","Lemon Egypt (4.94)","Pears Forelle (7.83)","Pure Harvest Tom (4.75)","Banana Chocolate (2.85)","Potato Egypt KG","Al Youm Chicken B","Bionic Chromebook","Galaxy Ice Cream","London Dairy STR","Plastic 12 (0.25)"]	image	t	{photos/photo_110@25-03-2025_14-01-22.jpg}	2026-02-27 17:48:58.128	2026-02-27 17:48:58.128	\N	default_farnoosh_mashreq	\N
message193	2025-03-23 00:00:00	11:57	10000.00	AED	income	cmm56s17000008ogezghgfclk	Mashreq Bank ATM (Metro Station)	واریز به حساب از طریق دستگاه ATM | واریز به حساب سینا از طریق دستگاه ATM	\N	image	t	{photos/photo_99@23-03-2025_11-57-20.jpg,photos/photo_100@23-03-2025_11-57-30.jpg}	2026-02-27 17:48:58.128	2026-02-27 20:08:38.178	\N	default_farnoosh_mashreq	\N
message194	2025-03-23 00:00:00	11:57	10000.00	AED	income	cmm56s17000008ogezghgfclk	Mashreq Bank ATM (Metro Station)	واریز به حساب سینا از طریق دستگاه ATM	\N	image	t	{photos/photo_100@23-03-2025_11-57-30.jpg}	2026-02-27 17:48:58.128	2026-02-27 20:08:38.178	message193	default_farnoosh_mashreq	\N
message186	2025-03-23 00:00:00	11:48	690.57	AED	expense	cmm56s17800028ogefz2eqqt0	Fresh Bazaar	\N	Groceries: fruits, vegetables, dairy, meat, fish, condiments	image	t	{photos/photo_95@23-03-2025_11-48-02.jpg}	2026-02-27 17:48:58.128	2026-02-28 08:09:44.862	message185	default_farnoosh_mashreq	\N
message187	2025-03-23 00:00:00	11:48	\N	AED	expense	cmm56s17800028ogefz2eqqt0	Fresh Bazaar	خرید از Fresh Bazaar	Duplicate of message186 (same receipt, bottom portion)	image	t	{photos/photo_96@23-03-2025_11-48-02.jpg}	2026-02-27 17:48:58.128	2026-02-28 08:09:44.862	message185	default_farnoosh_mashreq	\N
message200	2025-03-23 00:00:00	12:07	41.60	AED	expense	cmm56s17600018ogeqghk7vfb	Spinneys Sobha Hartland	خرید غذا از اسپینسپاستا، سالاد مرغ، نوشیدنی	\N	image	t	{photos/photo_104@23-03-2025_12-07-54.jpg}	2026-02-27 17:48:58.128	2026-02-28 08:11:31.889	\N	default_farnoosh_mashreq	\N
message204	2025-03-24 00:00:00	17:42	224.71	AED	expense	cmm56s17e00068ogeybi889nb	\N	۲۲۴.۷۱ درهم بابت ایجاری تو مرکز ایجاری پرداخت کردیم رسید نداد24th March12:21 PM	\N	text	f	{}	2026-02-27 17:48:58.128	2026-02-28 08:13:59.855	\N	default_farnoosh_mashreq	\N
message212	2025-03-26 00:00:00	19:25	52.60	AED	expense	cmm56s17800028ogefz2eqqt0	Geant Express (One Park Avenue, Sobha Hartland)	Geant	["Pril Dishwashing (15.85)","Al Youm Chicken B (32.75)","Fine Hand Towel (4.00)"]	image	t	{photos/photo_111@26-03-2025_19-25-49.jpg}	2026-02-27 17:48:58.128	2026-02-27 17:48:58.128	\N	default_farnoosh_mashreq	\N
message860	2025-12-25 00:00:00	23:03	1226.75	AED	expense	cmm56s17c00058ogea78vq636	Amazon.ae	\N	["Tabby payment 1 of 4 for Amazon.ae order (total AED 4907.00)"]	image	t	{photos/photo_512@25-12-2025_23-03-15.jpg}	2026-02-27 17:48:58.48	2026-02-28 09:31:00.04	message861	default_farnoosh_mashreq	\N
message225	2025-03-30 00:00:00	13:20	37.00	AED	expense	cmm56s17600018ogeqghk7vfb	Al Qubaisi Restaurant (Dubai Mall area)	خرید ۲ اسکوپ بستنی در دبی مال	["Ice cream at Al Qubaisi Restaurant"]	image	t	{photos/photo_118@30-03-2025_13-20-45.jpg}	2026-02-27 17:48:58.128	2026-02-27 17:48:58.128	\N	default_farnoosh_mashreq	\N
message226	2025-03-30 00:00:00	13:24	25.95	AED	expense	cmm56s17600018ogeqghk7vfb	\N	۲۵.۹۵ درهم از Waitrose سمبوسه و ساندویچ مرغ خریدیم رسید نداد28th March10:02 PM	\N	text	f	{}	2026-02-27 17:48:58.128	2026-02-27 17:48:58.128	\N	default_farnoosh_mashreq	\N
message227	2025-03-30 00:00:00	13:25	11.50	AED	expense	cmm56s17800028ogefz2eqqt0	Waitrose (Dubai Mall area)	خرید نوشیدنی طبیعی از Waitrose	["Drinks / beverages from Waitrose"]	image	t	{photos/photo_119@30-03-2025_13-25-49.jpg}	2026-02-27 17:48:58.128	2026-02-27 17:48:58.128	\N	default_farnoosh_mashreq	\N
message228	2025-03-30 00:00:00	13:31	27.28	AED	expense	cmm56s17800028ogefz2eqqt0	Geant Express (One Park Avenue, Sobha Hartland)	Geant	["LL Artis Multigrain (8.95)","Cucumber UAE KG 0.43kg (2.13)","Apple Golden France 0.666kg (7.98)","Banana Chiquita 1.034kg (8.22)"]	image	t	{photos/photo_120@30-03-2025_13-31-49.jpg}	2026-02-27 17:48:58.128	2026-02-27 17:48:58.128	\N	default_farnoosh_mashreq	\N
message237	2025-04-13 00:00:00	11:55	34.00	AED	expense	cmm56s17800028ogefz2eqqt0	\N	۳۴ درهم از سوپرمارکت Spinneys خرید کردیم رسیدشو نگرفتیم1st April 10:33 AM	\N	text	f	{}	2026-02-27 17:48:58.128	2026-02-27 17:48:58.128	\N	default_farnoosh_mashreq	\N
message238	2025-04-13 00:00:00	11:59	35.35	AED	expense	cmm56s17900038ogeyynewip3	Zed (Taxi)	تاکسی Zed از خونه به مکس امینی	["Taxi ride from Sobha Waves, Sobha Hartland to Dubai Opera"]	image	t	{photos/photo_121@13-04-2025_11-59-45.jpg}	2026-02-27 17:48:58.128	2026-02-27 17:48:58.128	\N	default_farnoosh_mashreq	\N
message239	2025-04-13 00:00:00	12:03	87.80	AED	expense	cmm56s17600018ogeqghk7vfb	Hatam Restaurant (Talabat)	رستوران حاتم - طلبات	["1x Hatam Mixed Grill (Zafran White rice) - AED 70.00","1x French fries - AED 12.00","1x Dough - AED 13.00","Discount - AED -20.00","Delivery fee - AED 8.90","Service fee - AED 3.90"]	image	t	{photos/photo_122@13-04-2025_12-03-03.jpg}	2026-02-27 17:48:58.128	2026-02-27 17:48:58.128	\N	default_farnoosh_mashreq	\N
message240	2025-04-13 00:00:00	12:05	19.60	AED	expense	cmm56s17900038ogeyynewip3	Zed (Taxi)	تاکسی Zed از مکس امینی به خونه	["Taxi ride from Downtown Dubai to Sobha Waves, Sobha Hartland"]	image	t	{photos/photo_123@13-04-2025_12-05-38.jpg}	2026-02-27 17:48:58.128	2026-02-27 17:48:58.128	\N	default_farnoosh_mashreq	\N
message241	2025-04-13 00:00:00	12:09	4.00	AED	expense	cmm56s17800028ogefz2eqqt0	\N	سینا ۴ درهم از سوپرمارکت Fullcart Fresh نون خریده رسیدشو نگرفته2nd April 07:34 AM	\N	text	f	{}	2026-02-27 17:48:58.128	2026-02-27 17:48:58.128	\N	default_farnoosh_mashreq	\N
message242	2025-04-13 00:00:00	12:11	12.00	AED	expense	cmm56s17900038ogeyynewip3	Zed (Taxi)	تاکسی روز اثباب کشی	["Taxi ride from Sobha Waves to Sobha Creek Vistas Reserve (moving day)"]	image	t	{photos/photo_124@13-04-2025_12-11-29.jpg}	2026-02-27 17:48:58.128	2026-02-27 17:48:58.128	\N	default_farnoosh_mashreq	\N
message222	2025-03-28 00:00:00	18:31	425.71	AED	expense	cmm5cqzf10001pw01d9pekwf0	Tabby (Amazon.ae)	قسط دوم ps با tabby	["Tabby installment payment 2/4 for Amazon.ae order"] | ["Payment 1: AED 425.71 - Paid 2 Mar","Payment 2: AED 425.71 - Paid 28 Mar","Payment 3: AED 425.71 - Due 2 May","Payment 4: AED 425.72 - Due 2 Jun"] | ["Order total: AED 1,702.85","Amount paid to date: AED 851.42","Amount remaining: AED 851.43"]	image	t	{photos/photo_115@28-03-2025_18-31-58.jpg,photos/photo_116@28-03-2025_18-31-58.jpg,photos/photo_117@28-03-2025_18-31-58.jpg}	2026-02-27 17:48:58.128	2026-02-28 08:17:43.102	\N	default_farnoosh_mashreq	\N
message214	2025-03-26 00:00:00	19:26	9000.00	AED	income	cmm56s17i00098oge2xb5or4t	Mashreq NEO (Fund Transfer)	کارت به کارت سینا به فرنوشمبلغ ۹۰۰۰ درهمبابت پاس شدن اولین چک‌ خونه + دیپازیت	["Bank transfer AED 9000 to Farnoosh Bagheri (Mashreq Bank)"]	file	t	{files/MWM2603251930133.PDF}	2026-02-27 17:48:58.128	2026-02-28 08:15:08.256	\N	default_farnoosh_mashreq	\N
message215	2025-03-26 00:00:00	19:26	9000.00	AED	expense	cmm56s17c00058ogea78vq636	\N	کارت به کارت سینا به فرنوشمبلغ ۹۰۰۰ درهمبابت پاس شدن اولین چک‌ خونه + دیپازیت	\N	text	f	{}	2026-02-27 17:48:58.128	2026-02-28 08:15:08.256	message214	default_farnoosh_mashreq	\N
message216	2025-03-26 00:00:00	19:37	42.00	AED	expense	cmm60aoac0000ry015m0ptwvq	Al Ain Food And Beverage	تسویه ۷ تا اب تا این جا با العین۳۰ تاش دیپازیته	["Al Ain Food & Beverage purchase"]	image	t	{photos/photo_112@26-03-2025_19-37-25.jpg}	2026-02-27 17:48:58.128	2026-02-28 08:15:28.563	\N	default_farnoosh_mashreq	\N
message217	2025-03-27 00:00:00	14:13	116.50	AED	expense	cmm56s17600018ogeqghk7vfb	Noon (Grand Barbeque Buffet Restaurant LLC)	سفارش کباب و جوجه از Persian Kebab	["Items x 1 (116.50)"] | ["Noon payment AED 116.50"]	file	t	{files/noon-doc-80038888.pdf,photos/photo_113@27-03-2025_14-13-26.jpg}	2026-02-27 17:48:58.128	2026-02-28 08:15:44.261	\N	default_farnoosh_mashreq	\N
message220	2025-03-28 00:00:00	11:44	2130.00	AED	expense	cmm56s17a00048ogeacrpia4x	DEWA (Dubai Electricity & Water Authority)	DEWA Depositدیپازیت دیوا	["Security Deposit (2000.00)","Reconnection Charges (100.00)","Knowledge Dirhams (10.00)","Innovation Dirhams (10.00)","Update of Customer Information (10.00)"] | DEWA security deposit	file	t	{files/Bill.pdf,files/Dubai_Electricity_&amp;_Water_Authority_Payment_Confirmation.pdf}	2026-02-27 17:48:58.128	2026-02-28 08:16:43.004	\N	default_farnoosh_mashreq	\N
message221	2025-03-28 00:00:00	11:50	9.75	AED	expense	cmm56s17800028ogefz2eqqt0	Fullcart Fresh Supermarket (Sobha Hartland)	خرید نان	["Bread / bakery items"]	image	t	{photos/photo_114@28-03-2025_11-50-40.jpg}	2026-02-27 17:48:58.128	2026-02-28 08:17:01.339	\N	default_farnoosh_mashreq	\N
message230	2025-03-30 00:00:00	13:34	76.74	AED	expense	cmm5cqzf10001pw01d9pekwf0	TEMU	خرید از TEMU	Towels, shower caddy, cable organizer, shelf liner, bath rug, laundry basket	file	t	{"files/TEMU Receipt.pdf"}	2026-02-27 17:48:58.128	2026-02-28 08:18:19.133	\N	default_farnoosh_mashreq	\N
message305	2025-05-12 00:00:00	11:22	33.00	AED	expense	cmm5cqzf10001pw01d9pekwf0	\N	سوغاتی لوازم بهداشتی:۱۱تا ضد آفتاب هر کدوم ۳۳ درهمضد چروک مامان سینا ۵۰ درهمجمعا ۴۱۰ درهم⚠️پول نقد دادیم⚠️	\N	text	f	{}	2026-02-27 17:48:58.208	2026-02-28 08:24:28.507	\N	default_farnoosh_mashreq	\N
message243	2025-04-13 00:00:00	12:13	103.20	AED	expense	cmm56s17600018ogeqghk7vfb	The Food Bazaar (Talabat)	سفارش غذا از Food Bazaar	["1x Special Pizza (2 person) - AED 55.00","2x Doogh Abali - AED 16.00","1x Joojeh Kabab Torsh (Boneless) - AED 42.00","Discount - AED -22.60","Delivery fee - AED 8.90","Service fee - AED 3.90"]	image	t	{photos/photo_125@13-04-2025_12-13-23.jpg}	2026-02-27 17:48:58.128	2026-02-27 17:48:58.128	\N	default_farnoosh_mashreq	\N
message932	2026-01-18 00:00:00	16:04	11.50	AED	expense	cmm56s17j000a8ogezifv1oi1	Urban Fresh Mini Mart Co. LLC	نواربهداشتی از سوپرمارکت پایین خونه	["Bandage/health supplies from neighborhood supermarket"]	image	t	{photos/photo_562@18-01-2026_16-04-13.jpg}	2026-02-27 17:48:58.553	2026-02-28 09:57:35.08	\N	default_farnoosh_mashreq	\N
message246	2025-04-13 00:00:00	12:18	232.29	AED	expense	cmm56s17800028ogefz2eqqt0	Geant Express (One Park Avenue)	Geant	["Lusine Multi Grain - AED 8.10","Loaf Bread Multi - AED 8.50","Farm Fresh Eggs - AED 15.50","Fine Toiledeluxe - AED 12.70","Salmon Fillet (0.31kg) - AED 30.05","Salmon Fillet (0.396kg) - AED 38.39","Salmon Fillet - AED 32.75","Alyoum Chicken B - AED 7.20","Almarai Feta Cheese - AED 12.10","Al Alali White M - AED 10.40","Al Alali Fancy M - AED 5.45","Tomato Round Sel - AED 3.96","Carrot Australia - AED 5.84","Pears Forelle - AED 7.22","Plum Red RSA - AED 4.18","Lettuce Romaine - AED 4.90","Onion Brown Spanish - AED 3.90","Potato Egypt - AED 8.59","Banana Chiquita - AED 6.50","Organic Capsicum - AED 6.26","Watermelon Iran","Tax - AED 11.06"]	image	t	{photos/photo_126@13-04-2025_12-18-00.jpg}	2026-02-27 17:48:58.128	2026-02-27 17:48:58.128	\N	default_farnoosh_mashreq	\N
message248	2025-04-13 00:00:00	12:20	35.25	AED	expense	cmm56s17800028ogefz2eqqt0	Urban Fresh Mini Mart Co. LLC	خرید بستنی و پفیلا	["Ice cream and puffs (bastani va pofila)"]	image	t	{photos/photo_127@13-04-2025_12-20-18.jpg}	2026-02-27 17:48:58.128	2026-02-27 17:48:58.128	\N	default_farnoosh_mashreq	\N
message251	2025-04-13 00:00:00	12:36	33.75	AED	expense	cmm56s17900038ogeyynewip3	Zed (Taxi)	تاکسی از خونه به کنسرت معین	["Taxi ride from Sobha Creek Vistas Reserve to Coca-Cola Arena (Moein concert)"]	image	t	{photos/photo_128@13-04-2025_12-36-34.jpg}	2026-02-27 17:48:58.128	2026-02-27 17:48:58.128	\N	default_farnoosh_mashreq	\N
message252	2025-04-13 00:00:00	12:36	20.62	AED	expense	cmm56s17900038ogeyynewip3	Zed (Taxi)	تاکسی از کنسرت معین به خونه	["Taxi ride from Al Safa St, Al Wasl (Moein concert) to Sobha Creek Vistas Reserve"]	image	t	{photos/photo_129@13-04-2025_12-36-53.jpg}	2026-02-27 17:48:58.128	2026-02-27 17:48:58.128	\N	default_farnoosh_mashreq	\N
message253	2025-04-13 00:00:00	12:39	412.32	AED	expense	cmm56s17800028ogefz2eqqt0	Carrefour (Talabat)	خرید از کارفور	["1x Alyoum Fresh Chicken Breast Fillet 1000g - AED 57.29","1x Lamb Minced Australia 1kg - AED 64.95","1x Lamb Stew Australia 1kg - AED 49.95","2x Norwegian Salmon Fillet 500g - AED 91.70","1x Khaleej White Eggs Medium 15pcs - AED 11.79","2x Carrefour Mini Wafers Cocoa Cream 125g - AED 14.98","1x Tiffany Bugles Ketchup Corn Snacks 75g - AED 3.99","1x Carrefour Sweet Chilli Tortilla Chips 180g - AED 5.99","1x Bayara Popcorn 400g - AED 4.99","1x Carrefour Halawa Pistachio 500g - AED 12.79","1x Jif Peanut Butter Creamy 453.6g - AED 17.49","1x Colgate Toothpaste Regular 4x75ml - AED 10.00","1x Whole Meal Sandwich Bread 700g - AED 7.95","1x Barbican Lemon NRB 330ml - AED 4.49","1x Barbican Pomegranate Non Alcoholic Malt Beverage 330ml - AED 4.49","1x Kalleh Yoghurt Seven 1.5kg - AED 11.29","1x Barilla Spaghetti No.5 2x500g - AED 10.00","2x Raisins Black Jumbo 200g - AED 18.00","1x Bayara Masoor Whole Red Lentils 400g - AED 4.79","6x bags (added item) - AED 1.50","Service fee - AED 3.90"]	image	t	{photos/photo_130@13-04-2025_12-39-27.jpg}	2026-02-27 17:48:58.128	2026-02-27 17:48:58.128	\N	default_farnoosh_mashreq	\N
message254	2025-04-13 00:00:00	12:41	70.85	AED	expense	cmm56s17800028ogefz2eqqt0	Talabat Mart	خرید از طلبات	["1x Bayara Mixed Dried Fruits & Nut 400g - AED 23.80","1x Bayara Mabroom Dates 400g - AED 29.28","1x Harpic Powerful Drain Opener Gel 1L - AED 15.28","Service fee - AED 2.49"]	image	t	{photos/photo_131@13-04-2025_12-41-20.jpg}	2026-02-27 17:48:58.128	2026-02-27 17:48:58.128	\N	default_farnoosh_mashreq	\N
message255	2025-04-13 00:00:00	12:45	25.12	AED	expense	cmm56s17900038ogeyynewip3	Zed (Taxi)	تاکسی Zed از خونه به Aya Universe	["Taxi ride from Sobha Creek Vistas Reserve to AYA, Wafi City"]	image	t	{photos/photo_132@13-04-2025_12-45-43.jpg}	2026-02-27 17:48:58.128	2026-02-27 17:48:58.128	\N	default_farnoosh_mashreq	\N
message257	2025-04-15 00:00:00	11:18	2000.00	AED	income	cmm56s17000008ogezghgfclk	Mashreq ATM (RTQA Branch)	واریز به حساب از طریق دستگاه ATM	["Cash deposit via ATM - AED 1000.00 x 2 = AED 2000.00","Deposit to account ending in 4538"]	image	t	{photos/photo_133@15-04-2025_11-18-34.jpg}	2026-02-27 17:48:58.128	2026-02-27 17:48:58.128	\N	default_farnoosh_mashreq	\N
message259	2025-04-16 00:00:00	10:51	117.21	AED	expense	cmm56s17800028ogefz2eqqt0	Geant Express (One Park Avenue)	Geant	["Organic Cucumber - AED 5.95","London Dairy Con - AED 23.95","Watermelon Iran - AED 8.76","Onion Red India - AED 3.73","Banana Chiquita - AED 7.36","Potato Egypt KG - AED 4.20","Apple Green Serb - AED 14.51","Mango Badami Ind - AED 11.56","Orange Valencia - AED 7.74","Namakin Mixed Pi - AED 12.50","Strawberry Turkey - AED 16.95","Tax - AED 5.58"]	image	t	{photos/photo_135@16-04-2025_10-51-16.jpg}	2026-02-27 17:48:58.128	2026-02-27 17:48:58.128	\N	default_farnoosh_mashreq	\N
message263	2025-04-19 00:00:00	15:45	63.86	AED	expense	cmm56s17800028ogefz2eqqt0	Geant Express - One Park Avenue	Geant	["Lettuce Romaine","Farm Fresh Eggs","Heinz Tomato Paste","Kolios Greek Yogurt","Bread Kraftkorn"]	image	t	{photos/photo_136@19-04-2025_15-45-26.jpg}	2026-02-27 17:48:58.128	2026-02-27 17:48:58.128	\N	default_farnoosh_mashreq	\N
message265	2025-04-26 00:00:00	15:45	154.10	AED	expense	cmm56s17800028ogefz2eqqt0	Geant Express - One Park Avenue	Geant	["Cheesecake Raspberry","Apple Green Serbia","Hello Sukkarv Da","Eggplant Premium","Banana Chiquita","Carrot Australia","Tomato Round Sel","Pears Vermont","Potato Egypt","Lemon South Africa","Clementine Turkey","Organic Capsicum","Cabbage Red UAE","Fine Hand Towel","Watermelon Iran","Bayara Dried Fruit","Strawberry Turkey","Onion Red India"]	image	t	{photos/photo_137@26-04-2025_15-45-58.jpg}	2026-02-27 17:48:58.128	2026-02-27 17:48:58.128	\N	default_farnoosh_mashreq	\N
message261	2025-04-19 00:00:00	15:40	10000.00	AED	income	cmm56s17i00098oge2xb5or4t	Mashreq Bank	کارت به کارت سینا به فرنوش	["Fund transfer to Farnoosh Bagheri"]	file	t	{files/MWM1704251984084.PDF}	2026-02-27 17:48:58.128	2026-02-28 07:18:18.559	\N	default_farnoosh_mashreq	\N
message245	2025-04-13 00:00:00	12:16	18750.00	AED	expense	cmm56s17e00068ogeybi889nb	\N	۱۸,۷۵۰ درهم اولین چک خونه پاس شده3rd April 09:34 AM	\N	text	f	{}	2026-02-27 17:48:58.128	2026-02-28 08:19:07.285	\N	default_farnoosh_mashreq	\N
message244	2025-04-13 00:00:00	12:15	7500.00	AED	expense	cmm56s17e00068ogeybi889nb	\N	۷,۵۰۰ درهم چک دیپازیت خونه پاس شده3rd April 09:34 AM	\N	text	f	{}	2026-02-27 17:48:58.128	2026-02-28 08:19:15.822	\N	default_farnoosh_mashreq	\N
message250	2025-04-13 00:00:00	12:32	225.45	AED	expense	cmm5cqzf10001pw01d9pekwf0	Amazon.ae	خرید سشوار و محصولات بهداشتی از آمازون	Philips hair dryer, Dettol handwash, LUX body wash, NIVEA antiperspirant	file	t	{"files/amazon.ae - Order 403-4087903-2529147.pdf"}	2026-02-27 17:48:58.128	2026-02-28 08:19:34.883	\N	default_farnoosh_mashreq	\N
message258	2025-04-15 00:00:00	11:19	50.00	AED	expense	cmm60aoac0000ry015m0ptwvq	Al Ain Food And Bevera	العین	["Al Ain water/food purchase"]	image	t	{photos/photo_134@15-04-2025_11-19-53.jpg}	2026-02-27 17:48:58.128	2026-02-28 08:20:53.14	\N	default_farnoosh_mashreq	\N
message273	2025-04-26 00:00:00	15:48	300.00	AED	expense	cmm56s17a00048ogeacrpia4x	Arabian Unigaz For Central Gas Filling Co. LLC	دیپازیت گاز	["Gas security deposit"]	image	t	{photos/photo_140@26-04-2025_15-48-20.jpg}	2026-02-27 17:48:58.208	2026-02-28 10:40:33.115	\N	default_farnoosh_mashreq	\N
message274	2025-04-26 00:00:00	15:49	105.60	AED	expense	cmm56s17600018ogeqghk7vfb	The Food Bazaar (Talabat)	خرید جوجه و کباب از Food Bazaar	["Kabab Koobideh x1","Joojeh Kabab (Boneless) x2","Doogh Abali x1"]	image	t	{photos/photo_141@26-04-2025_15-49-09.jpg}	2026-02-27 17:48:58.208	2026-02-27 17:48:58.208	\N	default_farnoosh_mashreq	\N
message277	2025-05-04 00:00:00	12:09	10.00	AED	expense	cmm56s17800028ogefz2eqqt0	\N	۱۰ درهم از سوپرمارکت پایین خونه نوار بهداشتی خریدم رسیدشو نگرفتم30th April 09:49 AM	\N	text	f	{}	2026-02-27 17:48:58.208	2026-02-27 17:48:58.208	\N	default_farnoosh_mashreq	\N
message283	2025-05-04 00:00:00	12:16	235.01	AED	expense	cmm56s17800028ogefz2eqqt0	Geant Express - One Park Avenue	Geant	["Rahma Virgin Olive Oil","Jif Peanut Butter","London D Minis","Bayara Dried Fruit","Bayara Dates Deglet","Juicies Juice Tumble x2","Potato Egypt","Apple Green Serbia","Orange Valencia","Peach PP","Tomato Round Sel","Lettuce Iceberg","Organic Cucumber","Plum Black Spain","Banana Chiquita","Apple Royal Gala","Driscoll's Blueberry","Carrot Australia","Mushroom White"]	image	t	{photos/photo_144@04-05-2025_12-16-27.jpg}	2026-02-27 17:48:58.208	2026-02-27 17:48:58.208	\N	default_farnoosh_mashreq	\N
message287	2025-05-04 00:00:00	12:19	27.00	AED	expense	cmm56s17900038ogeyynewip3	Zed (Careem)	تاکسی از خونه به مترو برجمان - Zed	["Taxi from Sobha Hartland to BurJuman Metro Station"]	image	t	{photos/photo_146@04-05-2025_12-19-51.jpg}	2026-02-27 17:48:58.208	2026-02-27 17:48:58.208	\N	default_farnoosh_mashreq	\N
message288	2025-05-04 00:00:00	12:21	10000.00	AED	income	cmm56s17000008ogezghgfclk	Mashreq ATM	واریز به حساب از طریق دستگاه ATM	["Cash deposit via ATM (10x AED 1,000 notes)"]	image	t	{photos/photo_147@04-05-2025_12-21-37.jpg}	2026-02-27 17:48:58.208	2026-02-27 17:48:58.208	\N	default_farnoosh_mashreq	\N
message290	2025-05-12 00:00:00	10:57	146.12	AED	expense	cmm56s17800028ogefz2eqqt0	Carrefour	کارفور	["Clorox Toilet Cleaner Original","Rio Mare Light Meat Tuna","Dac Clean And Fresh Toilet Rim","Lux Botanicals Perfumed Hand Wash","Fine Kitchen Tissue Roll Super","l'usine Sliced Multigrain Bread","Persil Power Gel Liquid Laundry","Carrefour Supreme Comfort Toilet Paper"]	image	t	{photos/photo_148@12-05-2025_10-57-09.jpg}	2026-02-27 17:48:58.208	2026-02-27 17:48:58.208	\N	default_farnoosh_mashreq	\N
message292	2025-05-12 00:00:00	10:58	217.07	AED	expense	cmm56s17800028ogefz2eqqt0	Geant Express - One Park Avenue	Geant	\N	image	t	{photos/photo_149@12-05-2025_10-58-17.jpg}	2026-02-27 17:48:58.208	2026-02-27 17:48:58.208	\N	default_farnoosh_mashreq	\N
message295	2025-05-12 00:00:00	11:10	18.70	AED	expense	cmm56s17900038ogeyynewip3	Zed (Taxi)	تاکسی از بازار دبی به پاساژ الغریر - Zed	\N	image	t	{photos/photo_150@12-05-2025_11-10-30.jpg}	2026-02-27 17:48:58.208	2026-02-27 17:48:58.208	\N	default_farnoosh_mashreq	\N
message297	2025-05-12 00:00:00	11:13	31.24	AED	expense	cmm56s17600018ogeqghk7vfb	Carrefour City	خرید غذا لازانیا و مرغ از کارفور	\N	image	t	{photos/photo_151@12-05-2025_11-13-54.jpg}	2026-02-27 17:48:58.208	2026-02-27 17:48:58.208	\N	default_farnoosh_mashreq	\N
message299	2025-05-12 00:00:00	11:16	56.00	AED	expense	cmm56s17600018ogeqghk7vfb	Al Qubaisi Ice Cream	بستنی و شربت در پاساژ الغریر	\N	image	t	{photos/photo_153@12-05-2025_11-16-29.jpg}	2026-02-27 17:48:58.208	2026-02-27 17:48:58.208	\N	default_farnoosh_mashreq	\N
message303	2025-05-12 00:00:00	11:20	480.00	AED	expense	cmm56s17g00088oge05l6cktv	LC Waikiki (Apparel LLC)	LC Waikiki - سوغاتیپاساژ الغریر	\N	image	t	{photos/photo_155@12-05-2025_11-20-56.jpg}	2026-02-27 17:48:58.208	2026-02-27 17:48:58.208	\N	default_farnoosh_mashreq	\N
message285	2025-05-04 00:00:00	12:17	459.66	AED	expense	cmm56s17a00048ogeacrpia4x	DEWA	اولین قبض دیواDewa	["DEWA electricity and water bill"] | ["DEWA bill payment - Apple Wallet confirmation"]	file	t	{files/Receipt.pdf,photos/photo_145@04-05-2025_12-17-27.jpg}	2026-02-27 17:48:58.208	2026-02-27 20:05:43.831	\N	default_farnoosh_mashreq	\N
message275	2025-04-29 00:00:00	17:32	130.00	AED	expense	cmm56s17a00048ogeacrpia4x	du	شارژ DU سیم کارت سینا	["du mobile recharge - Topup (971551507311)"] | ["du SIM card recharge Sina - Apple Wallet confirmation (971551507311)"]	file	t	{"files/Gmail - Successful recharge (3).pdf","files/2025-04-29 17.31.58.jpg"}	2026-02-27 17:48:58.208	2026-02-27 20:05:52.511	\N	default_farnoosh_mashreq	\N
message276	2025-04-29 00:00:00	17:32	130.00	AED	expense	cmm56s17a00048ogeacrpia4x	du	شارژ DU سیم کارت سینا	["du SIM card recharge Sina - Apple Wallet confirmation (971551507311)"]	file	t	{"files/2025-04-29 17.31.58.jpg"}	2026-02-27 17:48:58.208	2026-02-27 20:05:52.511	message275	default_farnoosh_mashreq	\N
message271	2025-04-26 00:00:00	15:47	50.00	AED	expense	cmm56s17a00048ogeacrpia4x	du	شارژ حساب du خودم	["du mobile recharge (971525662144)"] | ["du mobile recharge (971525662144) - Apple Wallet confirmation"]	image	t	{photos/photo_138@26-04-2025_15-47-17.jpg,photos/photo_139@26-04-2025_15-47-17.jpg}	2026-02-27 17:48:58.208	2026-02-27 20:06:02.512	\N	default_farnoosh_mashreq	\N
message289	2025-05-04 00:00:00	12:22	81.00	AED	expense	cmm56s17600018ogeqghk7vfb	Mashreq Bank	کارت به کارت به نگین بابت رستوران عروس دمشق	["Bank transfer to Negin Aliasghar Bahrami for restaurant Arous Damascus"]	file	t	{files/MLC0405250170254.PDF}	2026-02-27 17:48:58.208	2026-02-27 21:01:31.018	\N	default_farnoosh_mashreq	\N
message267	2025-04-26 00:00:00	15:46	309.47	AED	expense	cmm56s17800028ogefz2eqqt0	Carrefour Cityland Mall	خرید از کارفور	["Almarai Lite Feta Cheese","Australian Boneless Lamb Cubes","Australian Pure Lamb Mince","Bayara Brown Raisins","Bayara Dried Cranberries","Bayara Halved Walnuts","Bayara Supreme Mixed Dried Fruits and Nuts","Carrefour Fresh Cucumbers","Fresh Chicken Breast","Hamour Fillet Fresh","Kalleh Full Fat Seven Yoghurt","Kalleh Seven Laban","Sesame Dates Ma'amoul","White Mushrooms","l'usine Sliced White Bread"]	file	t	{files/72799094.pdf}	2026-02-27 17:48:58.208	2026-02-28 08:21:45.95	\N	default_farnoosh_mashreq	\N
message279	2025-05-04 00:00:00	12:11	425.72	AED	expense	cmm5cqzf10001pw01d9pekwf0	Amazon.ae (via Tabby)	قسط سوم ps با tabby	["PS5 installment 4 of 4 remaining (total order AED 1,702.85)"] | ["PS5 installment 3 of 4 (total order AED 1,702.85)"] | ["Tabby payment confirmation - PS5 installment 3 of 4"]	image	t	{photos/photo_143@04-05-2025_12-11-24.jpg,photos/photo_142@04-05-2025_12-11-24.jpg,files/Gmail_Thanks!_Here’s_your_tabby_payment_confirmation_.pdf}	2026-02-27 17:48:58.208	2026-02-28 08:23:16.796	\N	default_farnoosh_mashreq	\N
message294	2025-05-12 00:00:00	10:59	32.65	AED	expense	cmm5cqzf10001pw01d9pekwf0	\N	سینا ۳۲.۶۵ درهم از Geant خرید کرده رسیدشو نگرفته09th May 10:45 AM	\N	text	f	{}	2026-02-27 17:48:58.208	2026-02-28 08:23:52.258	\N	default_farnoosh_mashreq	\N
message298	2025-05-12 00:00:00	11:14	7.99	AED	expense	cmm5cqzf10001pw01d9pekwf0	Chemist Warehouse Al Ghurair Centre	سوهان ناخن	\N	image	t	{photos/photo_152@12-05-2025_11-14-16.jpg}	2026-02-27 17:48:58.208	2026-02-28 08:24:05.272	\N	default_farnoosh_mashreq	\N
message306	2025-05-12 00:00:00	11:23	127.25	AED	expense	cmm56s17800028ogefz2eqqt0	Day to Day	دی تو دیDay to day	\N	image	t	{photos/photo_156@12-05-2025_11-23-20.jpg}	2026-02-27 17:48:58.208	2026-02-27 17:48:58.208	\N	default_farnoosh_mashreq	\N
message308	2025-05-12 00:00:00	11:31	9.99	AED	expense	cmm56s17800028ogefz2eqqt0	Day to Day	دی تو دیDay to day	\N	image	t	{photos/photo_157@12-05-2025_11-31-14.jpg}	2026-02-27 17:48:58.208	2026-02-27 17:48:58.208	\N	default_farnoosh_mashreq	\N
message310	2025-05-12 00:00:00	11:35	47.18	AED	expense	cmm56s17900038ogeyynewip3	Zed (Taxi)	تاکسی از دی تو دی به خونه - Zed	\N	image	t	{photos/photo_158@12-05-2025_11-35-29.jpg}	2026-02-27 17:48:58.208	2026-02-27 17:48:58.208	\N	default_farnoosh_mashreq	\N
message311	2025-05-12 00:00:00	11:52	39.10	AED	expense	cmm56s17900038ogeyynewip3	Zed (Taxi)	تاکسی از خونه به بازار دبی - Zed	\N	image	t	{photos/photo_159@12-05-2025_11-52-27.jpg}	2026-02-27 17:48:58.208	2026-02-27 17:48:58.208	\N	default_farnoosh_mashreq	\N
message312	2025-05-12 00:00:00	12:04	50.00	AED	expense	cmm56s17a00048ogeacrpia4x	Al Ain Food And Beverage	شارژ العین	\N	image	t	{photos/photo_160@12-05-2025_12-04-06.jpg}	2026-02-27 17:48:58.208	2026-02-27 17:48:58.208	\N	default_farnoosh_mashreq	\N
message313	2025-05-20 00:00:00	02:37	230.36	AED	expense	cmm56s17800028ogefz2eqqt0	Geant (GMG Consumer LLC)	Geant	\N	image	t	{photos/photo_161@20-05-2025_02-37-17.jpg}	2026-02-27 17:48:58.208	2026-02-27 17:48:58.208	\N	default_farnoosh_mashreq	\N
message982	2026-01-28 00:00:00	23:39	324.26	AED	expense	cmm5cqzf10001pw01d9pekwf0	Amazon.ae	خرید لوازم خونه از آمازون660.53 درهم از آمازون لوازم خونه خریدم که 246.93 درهم برگشت. یعنی درواقع 413.6 درهم پرداخت کردم.28th January08:06 PM	["Dove 10 in 1 serum mask 38.99","SKEIDO bamboo dish sponges 39.00","eyfel reed diffuser mango 17.00","Royalford portable wardrobe 39.50","Jiawu wood serving tray 83.06","Nuova fruit/cake knife set 47.20","D DATADAGO water dispenser 30.30","XJARVIS sports socks 15.21","shipping 14.00"]	file	t	{"files/Order Details 3.pdf"}	2026-02-27 17:48:58.553	2026-02-28 10:02:06.364	\N	default_farnoosh_mashreq	\N
message316	2025-05-20 00:00:00	02:39	29.00	AED	expense	cmm56s17600018ogeqghk7vfb	\N	توی شهربازی ۲۹ درهم یخ در بهشت گرفتیم رسیدشو نگرفتیم17th May05:27 PM	\N	text	f	{}	2026-02-27 17:48:58.208	2026-02-27 17:48:58.208	\N	default_farnoosh_mashreq	\N
message317	2025-05-20 00:00:00	02:39	18.00	AED	expense	cmm56s17f00078oge3yf8pp6g	\N	توی شهربازی ۱۸ درهم پاپ کرن گرفتیم رسیدشو نگرفتیم17th May06:42 PM	\N	text	f	{}	2026-02-27 17:48:58.208	2026-02-27 17:48:58.208	\N	default_farnoosh_mashreq	\N
message321	2025-05-20 00:00:00	02:42	266.25	AED	expense	cmm56s17g00088oge05l6cktv	Centrepoint (Landmark Retail Investment Co. LLC)	خرید لباس ورزشی سینا و باباش	\N	image	t	{photos/photo_164@20-05-2025_02-42-22.jpg}	2026-02-27 17:48:58.208	2026-02-27 17:48:58.208	\N	default_farnoosh_mashreq	\N
message322	2025-05-20 00:00:00	02:42	117.00	AED	expense	cmm56s17g00088oge05l6cktv	LC Waikiki (LCW Deira City Centre)	Lc waikiki	\N	image	t	{photos/photo_165@20-05-2025_02-42-30.jpg}	2026-02-27 17:48:58.208	2026-02-27 17:48:58.208	\N	default_farnoosh_mashreq	\N
message324	2025-05-20 00:00:00	02:43	69.50	AED	expense	cmm56s17j000a8ogezifv1oi1	Life Pharmacy 52 (Deira City Centre)	قرص وارفارین مامان	\N	image	t	{photos/photo_166@20-05-2025_02-43-53.jpg}	2026-02-27 17:48:58.208	2026-02-27 17:48:58.208	\N	default_farnoosh_mashreq	\N
message326	2025-05-20 00:00:00	02:44	160.00	AED	expense	cmm56s17g00088oge05l6cktv	Max (Landmark Retail Investment Co. LLC, Deira City Centre)	خرید لباسای خودم	\N	image	t	{photos/photo_167@20-05-2025_02-44-49.jpg}	2026-02-27 17:48:58.208	2026-02-27 17:48:58.208	\N	default_farnoosh_mashreq	\N
message328	2025-05-20 00:00:00	02:45	29.47	AED	expense	cmm56s17600018ogeqghk7vfb	Carrefour	خرید پیتزا در کارفور	["Chicken Shawarma Pizza Slice x1 (13.99), Pepperoni Pizza Slice x1 (12.99), Sprite Can 330ml x1 (2.49)"]	image	t	{photos/photo_168@20-05-2025_02-45-48.jpg}	2026-02-27 17:48:58.208	2026-02-27 17:48:58.208	\N	default_farnoosh_mashreq	\N
message329	2025-05-20 00:00:00	02:46	440.62	AED	expense	cmm56s17800028ogefz2eqqt0	Carrefour	خرید سوغاتی‌ها از کارفور	["Toffifee 125g x15 (75.00), Alokozay Gin 50g x7 (59.43), Alokozay Peach Tea x1 (8.49), Frozen Bag x1 (5.99), Nivea Deo 150ml x2 (75.90), Nivea Deo 150ml x3 (113.85), Clear Shampoo 350ml x4 (103.16), Discount (-1.20)"]	image	t	{photos/photo_169@20-05-2025_02-46-01.jpg}	2026-02-27 17:48:58.208	2026-02-27 17:48:58.208	\N	default_farnoosh_mashreq	\N
message331	2025-05-20 00:00:00	02:57	54.50	AED	expense	cmm56s17900038ogeyynewip3	\N	تاکسی از پاساژ دیره به خونه ۵۴.۵۰ درهم شد رسیدشو نگرفتیم19th May06:29 PM	\N	text	f	{}	2026-02-27 17:48:58.208	2026-02-27 17:48:58.208	\N	default_farnoosh_mashreq	\N
message335	2025-05-21 00:00:00	18:40	69.50	AED	expense	cmm56s17600018ogeqghk7vfb	\N	🎁حساب کتاب سوغاتی‌ها🎁مامان و بابای فرنوش:مامان - قرص ۶۹.۵ درهممامان - بلیز ۳۴ درهممامان - شلوار ۳۹ درهمبابا - پیرهن سبز ۶۹ درهمشکلات - ۵ درهمچای - ۸.۵ درهمجمعا: ۲۲۵ درهممامان و بابای سینا:مامان - ضدآفتاب ۳۳ درهممامان - کرم ضد پیری ۵۰ درهمبابا - بلیز آبی ۴۹ درهمبابا - شلوار آبی ۹۹ درهمشکلات - ۵ درهمچای - ۸.۵ درهمجمعا: ۲۴۴.۵ درهمفرید و پریسا:فرید - پیرهن سفید ۵۹ درهمپریسا - بلیز ۲۹ درهمشکلات - ۵ درهمبگ - ۳ درهمجمعا: ۹۶ درهمفرزاد و سمانه و برکه:فرزاد - پیرهن مشکی ۵۹ درهمسمانه - عطر ۹۵۰ تومان معادل ۴۱ درهمبرکه - شلوارک جین ۴۹ درهمبرکه - شلوارک سبز - ۲۹ درهمبرکه - سارافن مشکی - ۴۴ درهمشکلات - ۵ درهمبگ - ۳ درهمجمعا: ۲۳۰ درهمخاله پوران:کیف -  ۷۹۰ تومان معادل ۳۴ درهمکرم دست - ۱۹۰ تومان معادل ۸ درهمشکلات - ۵ درهمچای - ۸.۵ درهمبگ - ۶ درهمجمعا: ۶۱.۵ درهمعلیرضا:ضدآفتاب - ۳۳ درهمشامپو مردونه - ۱۳ درهماسپری مردونه - ۱۳ درهمشکلات - ۵ درهمچای - ۸.۵ درهمبگ - ۶ درهمسامین - بلیز ۳۹ درهمسامین - شلوار ۳۴ درهمجمعا: ۱۵۱.۵ درهمخاله ملیحه:ضدآفتاب - ۳۳ درهماسپری زنونه - ۱۳ درهمشکلات - ۵ درهمچای - ۸.۵ درهمبگ - ۳ درهمجمعا: ۶۲.۵ درهممهشاد:ضدآفتاب - ۳۳ درهماسپری زنونه - ۱۳ درهمشکلات - ۵ درهمچای - ۸.۵ درهمبگ - ۳ درهمجمعا: ۶۲.۵ درهمخاله اکرم:ضدآفتاب - ۳۳ درهماسپری زنونه - ۱۳ درهمشامپو مردونه - ۱۳ درهماسپری مردونه - ۱۳ درهمشکلات - ۵ درهمچای - ۸.۵ درهمبگ - ۳ درهمجمعا: ۸۸.۵ درهمخاله مریم:اسپری زنونه - ۱۳ درهمشامپو مردونه - ۱۳ درهماسپری مردونه - ۱۳ درهمشکلات - ۵ درهمچای - ۸.۵ درهمبگ - ۳ درهمجمعا: ۵۵.۵ درهممهسا و ارشیا:ضدآفتاب - ۳۳ درهماسپری زنونه - ۱۳ درهمشامپو مردونه - ۱۳ درهماسپری مردونه - ۱۳ درهمشکلات - ۵ درهمبگ - ۳ درهمجمعا:  ۸۰ درهمهاله و سعید:ضدآفتاب - ۳۳ درهماسپری زنونه - ۱۳ درهمشامپو مردونه - ۱۳ درهماسپری مردونه - ۱۳ درهمشکلات - ۵ درهمبگ - ۳ درهمجمعا: ۸۰ درهمشیوا و محمد:ضدآفتاب - ۳۳ درهماسپری زنونه - ۱۳ درهمشامپو مردونه - ۱۳ درهماسپری مردونه - ۱۳ درهمشکلات - ۵ درهمبگ - ۳ درهمجمعا: ۸۰ درهممهتاب:ضدآفتاب - ۳۳ درهماسپری زنونه - ۱۳ درهمشکلات - ۵ درهمبگ - ۳ درهمجمعا: ۵۴ درهممهسا شهریاری:ضدآفتاب - ۳۳ درهماسپری زنونه - ۱۳ درهمشکلات - ۵ درهمبگ - ۳ درهمجمعا: ۵۴ درهم⚠️جمع کل سوغاتی‌ها: ۱,۶۲۶ درهم⚠️	\N	text	f	{}	2026-02-27 17:48:58.208	2026-02-27 17:48:58.208	\N	default_farnoosh_mashreq	\N
message336	2025-05-21 00:00:00	18:43	69.00	AED	expense	cmm56s17800028ogefz2eqqt0	\N	🛍خریدهای خودمون🛍فرنوششلوارک طوسی - ۶۹ درهمشلوارک آبی - ۶۰ درهمژیله سفید - ۷۰ درهمتاپ صورتی - ۳۰ درهممایو پایین تنه - ۴۴ درهمسیناشلوارک سبز - ۷۹ درهمبلیز سبز - ۳۹ درهم	\N	text	f	{}	2026-02-27 17:48:58.208	2026-02-27 17:48:58.208	\N	default_farnoosh_mashreq	\N
message319	2025-05-20 00:00:00	02:41	27.50	AED	expense	cmm56s17900038ogeyynewip3	Zed (Taxi)	تاکسی از خونه به پاساژ دیره - zed	\N	image	t	{photos/photo_162@20-05-2025_02-41-40.jpg,photos/photo_163@20-05-2025_02-41-40.jpg}	2026-02-27 17:48:58.208	2026-02-27 20:05:18.444	\N	default_farnoosh_mashreq	\N
message332	2025-05-20 00:00:00	10:41	38.00	AED	expense	cmm56s17900038ogeyynewip3	Zed (Dubai Taxi)	تاکسی از خونه به فرودگاه - Zed	["Taxi from Sobha Creek Vistas Reserve to Airport Terminal 1 Dubai"] | ["Taxi from Sobha Creek Vistas Reserve to Airport Terminal 1 Dubai (same journey as photo_170, showing payment total)"]	image	t	{photos/photo_170@20-05-2025_10-41-12.jpg,photos/photo_171@20-05-2025_10-41-12.jpg}	2026-02-27 17:48:58.208	2026-02-27 20:05:26.006	\N	default_farnoosh_mashreq	\N
message318	2025-05-20 00:00:00	02:40	584.00	AED	expense	cmm56s17f00078oge3yf8pp6g	Neximo Project Management Services Co LLC	کارت به کارت به نگین بابت شهربازی، وافل و شام	\N	file	t	{files/MLC1805251229897.PDF}	2026-02-27 17:48:58.208	2026-02-27 21:01:25.595	\N	default_farnoosh_mashreq	\N
message314	2025-05-20 00:00:00	02:37	120.43	AED	expense	cmm56s17800028ogefz2eqqt0	Carrefour Cityland Mall (Online Delivery)	کارفور	\N	file	t	{files/73716089.pdf}	2026-02-27 17:48:58.208	2026-02-28 08:25:08.956	\N	default_farnoosh_mashreq	\N
message315	2025-05-20 00:00:00	02:37	\N	AED	expense	cmm56s17800028ogefz2eqqt0	\N	کارفور	\N	text	f	{}	2026-02-27 17:48:58.208	2026-02-28 08:25:08.956	message314	default_farnoosh_mashreq	\N
message375	2025-07-13 00:00:00	13:03	10000.00	AED	income	cmm56s17000008ogezghgfclk	\N	سینا هاشمی ۱۰٫۰۰۰ درهم به حسابم واریز کرد12th July06:30 PM	\N	text	f	{}	2026-02-27 17:48:58.208	2026-02-28 08:33:26.632	\N	default_farnoosh_mashreq	\N
message992	2026-01-29 00:00:00	00:06	70.00	AED	expense	cmm5cqzf10001pw01d9pekwf0	Home Centre	خرید تی۲ بشقاب و ۲ پیش‌دستی سفید از هوم سنتر - homecentre	["Quiki-Kleen 2-in-1 wet and dry spray mop 36","Essential dinner plate 27cm x2 8","2 white aprons","shipping 18"] | ["Quiki-Kleen 2-in-1 wet and dry spray mop 36","Essential dinner plate 27cm x2 8","shipping 18"]	image	t	{photos/photo_593@29-01-2026_00-06-08.jpg,photos/photo_592@29-01-2026_00-06-08.jpg}	2026-02-27 17:48:58.553	2026-02-28 10:04:08.501	\N	default_farnoosh_mashreq	\N
message358	2025-07-06 00:00:00	13:16	74.00	AED	expense	cmm56s17900038ogeyynewip3	Dubai Taxi Corporation	تاکسی از فرودگاه به خونه	["Taxi from airport to home, paid via Mashreq Visa Debit Platinum Card on 7/4/25"]	image	t	{photos/photo_175@06-07-2025_13-16-08.jpg}	2026-02-27 17:48:58.208	2026-02-27 17:48:58.208	\N	default_farnoosh_mashreq	\N
message360	2025-07-06 00:00:00	13:19	344.00	AED	expense	cmm56s17600018ogeqghk7vfb	Rivas Restaurant	خرید غذا از ریواس	["Food purchase from Rivas Restaurant, paid via Mashreq Visa Debit Platinum Card on 7/4/25"]	image	t	{photos/photo_177@06-07-2025_13-19-21.jpg}	2026-02-27 17:48:58.208	2026-02-27 17:48:58.208	\N	default_farnoosh_mashreq	\N
message361	2025-07-06 00:00:00	13:21	253.11	AED	expense	cmm56s17800028ogefz2eqqt0	Carrefour	کارفور	["Cucumbers 500g (3.99), Large White Eggs (11.49), I-Tech LR6-AA Alkaline batteries (3.99), Lux Botanicals Hand Wash (28.29), White Mushrooms 250g (4.99), Kalleh Full Fat Seven Yoghurt (11.49), Magnum Double Black Mulberry (13.79), Fusine Multigrain Sliced Brown bread (3.49), Kalleh Willie Cream Cheese 350 (16.29), Almarai Low Fat and Less Salt (4.99), Fusine Bran Sliced Bread 615g (4.79), Fresh Organic Salmon Fillet (129.99), London Dairy Double Chocolate (5.79), London Dairy Natural Strawberry (5.79), Delivery charge (3.95), Service fee (3.95)"]	image	t	{photos/photo_178@06-07-2025_13-21-20.jpg}	2026-02-27 17:48:58.208	2026-02-27 17:48:58.208	\N	default_farnoosh_mashreq	\N
message364	2025-07-06 00:00:00	13:24	153.04	AED	expense	cmm56s17800028ogefz2eqqt0	Geant Express	Geant	["Lettuce Romaine (2.74), Lettuce Romaine (3.20), Lettuce Iceberg (11.03), Celery Stick (3.97), Potato Egypt (8.95), EP Capsicum Mix (3.40), Grapefruit Star (3.13), Onion Red India (7.52), Tomato Red Bunch (8.21), Apple Green France (17.05), Avocado Ready To (3.87), Carrot Australia (11.58), RD Sesame Seed (13.95), Driscolls Blueberry (21.04), Nectarine Yellow (7.71), Banana Chiquita (6.83), Lemon South Africa (5.82), Orange Valencia (13.85), Apricot Lebanon"]	image	t	{photos/photo_179@06-07-2025_13-24-52.jpg}	2026-02-27 17:48:58.208	2026-02-27 17:48:58.208	\N	default_farnoosh_mashreq	\N
message369	2025-07-09 00:00:00	21:25	1225.00	AED	expense	cmm56s17a00048ogeacrpia4x	Bashar Georgi Alarbaji Alsayegh	پرداخت پول اینترنت ۳ ماه اول به بشارAprilMayJune	["Internet payment for 3 months (April, May, June) to Bashar"]	file	t	{files/WLC0907252156335.pdf}	2026-02-27 17:48:58.208	2026-02-27 17:48:58.208	\N	default_farnoosh_mashreq	\N
message370	2025-07-13 00:00:00	12:56	223.58	AED	expense	cmm56s17800028ogefz2eqqt0	Carrefour	کارفور	["Australian Pure Lamb Mince - 26.00","Fresh Chicken Breast - 50.79","Carrefour Fresh Large White Eggs - 11.49","Australian Boneless Lamb Cubes - 38.50","Oral-B Essential Waxed Mint Dental Floss - 11.79","L'usine Bran Sliced Bread 615g - 4.79","Protein Sandwich Bread 450g - 10.79","Norwegian Salmon Fillet - 48.50","Carrefour Fresh Cucumbers 500g - 3.99","Carrefour Ready-to-Eat Avocado - 12.99","Service Fee - 3.95"]	image	t	{photos/photo_181@13-07-2025_12-56-40.jpg}	2026-02-27 17:48:58.208	2026-02-27 17:48:58.208	\N	default_farnoosh_mashreq	\N
message372	2025-07-13 00:00:00	12:58	248.00	AED	expense	cmm56s17800028ogefz2eqqt0	Seyed Kazem Mirjalili General Trading LLC	میوه ایرانی از سید کاظم میرجلیلی	["Nectarine Irani Pak - 15.00","Peach Pak - 15.00","Kiwi Green Pak - 15.00","Cherry Irani KG - 25.00","Albalo Iri KG - 35.00","Apricot Irani Pak - 10.00","Golestan Cinnamon Powder 250g - 10.00","Alis Mint 1.5L - 19.99","Frozen Sabzi Ghormeh 400g - 12.00","Frozen Sabzi Polo 400g - 13.00","Sahar Green Olives Pickle 640g - 10.00","Delpazir Thousand Island 450g - 9.00","Delpazir Tomato Ketchup 450g - 8.00","Dry Alobokhara 1.06kg - 31.79","Delivery Charges - 20.00"]	image	t	{photos/photo_182@13-07-2025_12-58-38.jpg}	2026-02-27 17:48:58.208	2026-02-27 17:48:58.208	\N	default_farnoosh_mashreq	\N
message374	2025-07-13 00:00:00	13:02	63.75	AED	expense	cmm56s17800028ogefz2eqqt0	\N	سینا ۶۳.۷۵ درهم از سوپرمارکت پایین خونه حوله، پنبه و استون خرید کرده رسیدشو نگرفته12th July 01:41 PM	\N	text	f	{}	2026-02-27 17:48:58.208	2026-02-27 17:48:58.208	\N	default_farnoosh_mashreq	\N
message338	2025-07-06 00:00:00	12:37	425.72	AED	expense	cmm56s17l000b8ogen8sv9jjw	Tabby (Amazon.ae)	قسط چهارم (آخر) ps با tabby	["PS5 installment 4/4 (final) via Tabby - Pay in 4 schedule: Mar 425.71, Apr 425.71, May 425.71, Jun 425.72. Order total 1702.85"]	image	t	{photos/photo_172@06-07-2025_12-37-39.jpg}	2026-02-27 17:48:58.208	2026-02-27 20:04:37.25	message337	default_farnoosh_mashreq	\N
message341	2025-07-06 00:00:00	12:48	482.65	AED	expense	cmm56s17a00048ogeacrpia4x	DEWA	دومین قبض دیواDewa | رسید پرداخت قبض دیواDewa	["DEWA bill May 2025: Electricity 54.58, Water 86.54, Housing fee 312.50, Sewerage 29.03, VAT 6.72"] | ["DEWA bill payment receipt, paid via Apple Pay on 07/06/2025"] | ["DEWA payment confirmation via Mashreq Visa Debit Platinum Card on 6/7/25"]	file	t	{"files/Bill (1).pdf","files/Receipt (1).pdf",photos/photo_173@06-07-2025_12-50-58.jpg}	2026-02-27 17:48:58.208	2026-02-27 20:04:43.204	\N	default_farnoosh_mashreq	\N
message342	2025-07-06 00:00:00	12:48	482.65	AED	expense	cmm56s17a00048ogeacrpia4x	DEWA	رسید پرداخت قبض دیواDewa	["DEWA bill payment receipt, paid via Apple Pay on 07/06/2025"]	file	t	{"files/Receipt (1).pdf"}	2026-02-27 17:48:58.208	2026-02-27 20:04:43.204	message341	default_farnoosh_mashreq	\N
message345	2025-07-06 00:00:00	12:56	5000.00	AED	income	cmm56s17i00098oge2xb5or4t	Mashreq Bank	کارت به کارت سینا به فرنوش - ۵۰۰۰ درهم	["Fund transfer from Sina Ghadri to Farnoosh Bagheri, purpose: Family Support, ref: MWM3006252012837, date: 30/06/2025"]	file	t	{files/MWM3006252012837.PDF}	2026-02-27 17:48:58.208	2026-02-28 07:12:10.971	\N	default_farnoosh_mashreq	\N
message367	2025-07-06 00:00:00	13:29	8000.00	AED	income	cmm56s17i00098oge2xb5or4t	Mashreq Bank	کارت به کارت سینا به فرنوش - ۸۰۰۰ درهم	["Fund transfer from Sina Ghadri to Farnoosh Bagheri, purpose: Family Support, ref: MWM0607251091190, date: 06/07/2025"]	file	t	{files/MWM0607251091190.PDF}	2026-02-27 17:48:58.208	2026-02-28 07:12:34.814	\N	default_farnoosh_mashreq	\N
message346	2025-07-06 00:00:00	12:58	18750.00	AED	expense	cmm56s17e00068ogeybi889nb	\N	۱۸,۷۵۰ درهم دومین چک خونه پاس شده3rd July 05:06 AM	\N	text	f	{}	2026-02-27 17:48:58.208	2026-02-28 08:26:50.811	\N	default_farnoosh_mashreq	\N
message359	2025-07-06 00:00:00	13:16	15.00	AED	expense	cmm60aoac0000ry015m0ptwvq	Urban Fresh Mini Mart Co. LLC	خرید یه بسته آب معدنی ۶ تایی	["Pack of 6 mineral water bottles, paid via Mashreq Visa Debit Platinum Card on 7/4/25"]	image	t	{photos/photo_176@06-07-2025_13-16-35.jpg}	2026-02-27 17:48:58.208	2026-02-28 08:27:18.03	\N	default_farnoosh_mashreq	\N
message368	2025-07-07 00:00:00	16:14	11.50	AED	expense	cmm5cqzf10001pw01d9pekwf0	Granprix Mini Mart Llc	خرید باتری	["Battery purchase, paid via Mashreq Visa Debit Platinum Card on 7/7/25"]	image	t	{photos/photo_180@07-07-2025_16-14-14.jpg}	2026-02-27 17:48:58.208	2026-02-28 08:32:18.207	\N	default_farnoosh_mashreq	\N
message376	2025-07-13 00:00:00	13:04	461.80	AED	expense	cmm56s17600018ogeqghk7vfb	PAUL	رستوران PAUL با نگین اینا۲۵۲ برای ما بود	["1x Chicken Cordon Bleu - 89.00","2x Poulet Sauce Citronnee - 178.00","1x Can Coca Cola - 17.00","2x Can Sprite - 34.00","1x Entrecote Steak & Frites - 139.00","Service Fee - 4.80"]	image	t	{photos/photo_183@13-07-2025_13-04-01.jpg}	2026-02-27 17:48:58.208	2026-02-27 17:48:58.208	\N	default_farnoosh_mashreq	\N
message377	2025-07-13 00:00:00	13:59	500.00	AED	transfer	cmm56s17i00098oge2xb5or4t	Mashreq NEO	کارت به کارت به حساب بانک ماریا Mbank خودم	["Own account transfer to Al Maryah Community Bank (Mbank)"]	file	t	{files/WLC1307251388935.pdf}	2026-02-27 17:48:58.208	2026-02-27 17:48:58.208	\N	default_farnoosh_mashreq	\N
message378	2025-07-15 00:00:00	14:18	31.58	AED	expense	cmm56s17800028ogefz2eqqt0	Geant Express - One Park Avenue	Geant	["Carrot Australia 0.534kg - 3.18","Lemon South Africa 0.84kg - 7.52","Mushroom White - 7.95","Potato Egypt 1.248kg - 4.93","Banana Chiquita 0.635kg - 4.25","Onion Red India 0.948kg - 3.75"]	image	t	{photos/photo_184@15-07-2025_14-18-59.jpg}	2026-02-27 17:48:58.208	2026-02-27 17:48:58.208	\N	default_farnoosh_mashreq	\N
message486	2025-08-26 00:00:00	17:53	7.50	AED	expense	cmm56s17800028ogefz2eqqt0	\N	از Geant لیمو ۷.۵ درهم خریدیم25th August07:04 PM	\N	text	f	{}	2026-02-27 17:48:58.278	2026-02-28 10:30:48.411	\N	default_farnoosh_mashreq	\N
message385	2025-07-16 00:00:00	13:54	10000.00	AED	income	cmm56s17i00098oge2xb5or4t	Mashreq ATM	واریز به حساب از طریق دستگاه ATM	["Cash deposit via ATM - 20x AED 500 notes to account 019101544538 (Farnoosh Bagheri)"]	image	t	{photos/photo_188@16-07-2025_13-54-21.jpg}	2026-02-27 17:48:58.208	2026-02-27 17:48:58.208	\N	default_farnoosh_mashreq	\N
message386	2025-07-26 00:00:00	13:58	43.50	AED	expense	cmm56s17900038ogeyynewip3	CarsTaxi	تاکسی از خونه به سمت بانک مشرق برای افتتاح حساب شرکتی	["Taxi from home to Mashreq Bank for company account opening"]	image	t	{photos/photo_189@26-07-2025_13-58-18.jpg}	2026-02-27 17:48:58.208	2026-02-27 17:48:58.208	\N	default_farnoosh_mashreq	\N
message387	2025-07-26 00:00:00	13:58	43.50	AED	expense	cmm56s17900038ogeyynewip3	Hala Taxi	\N	["Hala Taxi ride 13km in 16min - Sobha Creek Vistas Reserve to 31 1B St Al Mankhool, paid cash"]	image	t	{photos/photo_190@26-07-2025_13-58-18.jpg}	2026-02-27 17:48:58.208	2026-02-27 17:48:58.208	\N	default_farnoosh_mashreq	\N
message388	2025-07-26 00:00:00	13:59	22.00	AED	expense	cmm56s17900038ogeyynewip3	Dubai Taxi Corporation	\N	["Taxi from Mashreq Bank to Emirates Bank"]	image	t	{photos/photo_191@26-07-2025_13-59-50.jpg}	2026-02-27 17:48:58.208	2026-02-27 17:48:58.208	\N	default_farnoosh_mashreq	\N
message389	2025-07-26 00:00:00	13:59	22.00	AED	expense	cmm56s17900038ogeyynewip3	Hala Taxi	تاکسی از بانک مشرق به بانک امارات	["Hala Taxi ride 5km in 11min - to Sheikh Zayed Rd Trade Centre, paid cash"]	image	t	{photos/photo_192@26-07-2025_13-59-50.jpg}	2026-02-27 17:48:58.208	2026-02-27 17:48:58.208	\N	default_farnoosh_mashreq	\N
message390	2025-07-26 00:00:00	14:00	28.50	AED	expense	cmm56s17900038ogeyynewip3	Dubai Taxi Corporation	\N	["Taxi from Emirates Bank to home"]	image	t	{photos/photo_193@26-07-2025_14-00-16.jpg}	2026-02-27 17:48:58.208	2026-02-27 17:48:58.208	\N	default_farnoosh_mashreq	\N
message391	2025-07-26 00:00:00	14:00	28.50	AED	expense	cmm56s17900038ogeyynewip3	Hala Taxi	تاکسی از بانک امارات به خونه	["Hala Taxi ride 9km in 11min - Al Wasl Tower Sheikh Zayed Rd to Sobha Creek Vistas Reserve, paid cash"]	image	t	{photos/photo_194@26-07-2025_14-00-16.jpg}	2026-02-27 17:48:58.208	2026-02-27 17:48:58.208	\N	default_farnoosh_mashreq	\N
message392	2025-07-26 00:00:00	14:03	30.75	AED	expense	cmm56s17800028ogefz2eqqt0	Urban Fresh Mini Mart Co. LLC	خرید تخم مرغ از سوپرمارکت پایین خونه	["Eggs purchase from supermarket downstairs"]	image	t	{photos/photo_195@26-07-2025_14-03-18.jpg}	2026-02-27 17:48:58.208	2026-02-27 17:48:58.208	\N	default_farnoosh_mashreq	\N
message393	2025-07-26 00:00:00	14:05	17.00	AED	expense	cmm56s17800028ogefz2eqqt0	Urban Fresh Mini Mart Co. LLC	خرید لیمو یا نون از سوپرمارکت پایین خونه	["Lemon or bread purchase from supermarket downstairs"]	image	t	{photos/photo_196@26-07-2025_14-05-12.jpg}	2026-02-27 17:48:58.208	2026-02-27 17:48:58.208	\N	default_farnoosh_mashreq	\N
message394	2025-07-26 00:00:00	14:05	39.75	AED	expense	cmm56s17800028ogefz2eqqt0	Urban Fresh Mini Mart Co. LLC	خرید حوله طوسی از سوپرمارکت پایین خونه	["Towel purchase from supermarket downstairs"]	image	t	{photos/photo_197@26-07-2025_14-05-51.jpg}	2026-02-27 17:48:58.208	2026-02-27 17:48:58.208	\N	default_farnoosh_mashreq	\N
message395	2025-07-26 00:00:00	14:16	199.65	AED	expense	cmm56s17800028ogefz2eqqt0	Choithrams	CHOITHRAMS	["Banana Chiquita Ecuador 1.122kg - 7.80","Chilli India 0.089kg - 1.15","Cauliflower Per Piece - 5.95","Lettuce Fresh 0.813kg - 5.65","Sweet Corn 0.925kg - 9.20","Tomato Fresh 1.013kg - 4.00","Eggplant GCC 0.966kg - 8.65","Apple Green France 0.643kg - 6.40","Celery Organic PP (MG) - 27.45","Grapefruit Turkey 0.844kg - 7.55","Potato GCC 1.254kg - 3.70","Onion Organic PP (MG) - 28.95","Heinz Tomato Paste 380g - 5.00","Heinz RTS Soup Cream Tomato 400g - 8.75","Avocado Kenya 0.639kg - 9.55","Mushroom Local 250g - 6.95","Lusine Bran Sliced Bread 615g - 6.95","Evening Protein Bread Small Slice 400g - 11.25","Lindt Excellence Cocoa 90% 100g - 30.25"]	image	t	{photos/photo_198@26-07-2025_14-16-24.jpg}	2026-02-27 17:48:58.208	2026-02-27 17:48:58.208	\N	default_farnoosh_mashreq	\N
message397	2025-07-26 00:00:00	14:17	204.75	AED	expense	cmm56s17800028ogefz2eqqt0	Choithrams	CHOITHRAMS	\N	image	t	{photos/photo_199@26-07-2025_14-17-24.jpg}	2026-02-27 17:48:58.208	2026-02-27 17:48:58.208	\N	default_farnoosh_mashreq	\N
message399	2025-07-26 00:00:00	14:18	110.00	AED	expense	cmm56s17f00078oge3yf8pp6g	Reel Cinemas	بلیت سینما	\N	image	t	{photos/photo_200@26-07-2025_14-18-24.jpg}	2026-02-27 17:48:58.208	2026-02-27 17:48:58.208	\N	default_farnoosh_mashreq	\N
message401	2025-07-26 00:00:00	14:19	34.00	AED	expense	cmm56s17900038ogeyynewip3	Hala Taxi (Careem)	تاکسی از خونه به سینما	\N	image	t	{photos/photo_202@26-07-2025_14-19-03.jpg}	2026-02-27 17:48:58.208	2026-02-27 17:48:58.208	\N	default_farnoosh_mashreq	\N
message402	2025-07-26 00:00:00	14:20	49.00	AED	expense	cmm56s17600018ogeqghk7vfb	Noon O Kabab	رستوران دبی مال بعد از سینما	\N	image	t	{photos/photo_203@26-07-2025_14-20-51.jpg}	2026-02-27 17:48:58.208	2026-02-27 17:48:58.208	\N	default_farnoosh_mashreq	\N
message404	2025-07-26 00:00:00	14:23	27.50	AED	expense	cmm56s17900038ogeyynewip3	\N	تاکسی سینما به خونه ۲۷.۵۰ درهم شد رسید نگرفتیم26th July 12:06 AM	\N	text	f	{}	2026-02-27 17:48:58.208	2026-02-27 17:48:58.208	\N	default_farnoosh_mashreq	\N
message383	2025-07-15 00:00:00	14:49	50.00	AED	expense	cmm56s17a00048ogeacrpia4x	du	شارژ حساب DU سیم کارت خودم	["DU SIM card recharge"] | ["DU mobile recharge confirmation - 50 AED to 971525662144"]	image	t	{photos/photo_186@15-07-2025_14-49-45.jpg,photos/photo_187@15-07-2025_14-49-45.jpg}	2026-02-27 17:48:58.208	2026-02-27 20:03:30.613	\N	default_farnoosh_mashreq	\N
message382	2025-07-15 00:00:00	14:49	100.00	AED	expense	cmm60aoac0000ry015m0ptwvq	Al Ain Food And Beverage	شارژ العین	["Al Ain water/beverage charge"]	image	t	{photos/photo_185@15-07-2025_14-49-39.jpg}	2026-02-27 17:48:58.208	2026-02-28 08:34:11.068	\N	default_farnoosh_mashreq	\N
message400	2025-07-26 00:00:00	14:18	54.00	AED	expense	cmm56s17600018ogeqghk7vfb	Reel Cinemas	پاپ کورن برای سینما	\N	image	t	{photos/photo_201@26-07-2025_14-18-32.jpg}	2026-02-27 17:48:58.208	2026-02-28 08:36:54.004	\N	default_farnoosh_mashreq	\N
message477	2025-08-23 00:00:00	22:28	2267.99	AED	expense	cmm5cqzf10001pw01d9pekwf0	Amazon.ae	خرید جاروبرقی، چای ساز، توستر و موس از آمازونamazon	["Dyson V12 Detect Slim Cordless Vacuum Cleaner, Yellow/Iron - AED 1490.0","Feller Germany Retro Style 1.7L 2-in-1 Stainless Steel Tea Maker+Kettle - AED 314.99","Logitech MX Vertical Ergonomic Wireless Mouse - AED 322.0","Philips Toaster Viva Collection HD2637/91 - AED 141.0","Shipping & Handling - AED 9.76","Estimated VAT - AED 22.28","Promotion applied - AED -10.0"]	file	t	{"files/amazon.ae - Order 403-8149554-4446704.pdf"}	2026-02-27 17:48:58.278	2026-02-28 10:35:24.032	\N	default_farnoosh_mashreq	\N
message407	2025-07-26 00:00:00	14:29	41.50	AED	expense	cmm56s17800028ogefz2eqqt0	\N	سینا ۴۱.۵۰ درهم از سوپرمارکت پایین خونه نان، تخم مرغ خرید کرده رسیدشو نگرفته26th July 10:22 AM	\N	text	f	{}	2026-02-27 17:48:58.208	2026-02-27 17:48:58.208	\N	default_farnoosh_mashreq	\N
message410	2025-07-28 00:00:00	15:31	27.00	AED	expense	cmm56s17600018ogeqghk7vfb	\N	با نگین اینا توی ایکیا بستنی خوردیم ۲۷ درهم۹ درهمش مال ماست26th July 07:47 PM	\N	text	f	{}	2026-02-27 17:48:58.278	2026-02-27 17:48:58.278	\N	default_farnoosh_mashreq	\N
message413	2025-07-28 00:00:00	15:37	126.00	AED	expense	cmm56s17600018ogeqghk7vfb	IKEA Restaurant	شام ایکیا با نگین اینا۵۶ درهمش مال ماست	\N	image	t	{photos/photo_207@28-07-2025_15-37-57.jpg}	2026-02-27 17:48:58.278	2026-02-27 17:48:58.278	\N	default_farnoosh_mashreq	\N
message414	2025-07-28 00:00:00	15:39	1000.00	AED	transfer	cmm56s17i00098oge2xb5or4t	Mashreq Bank	انتقال به حساب شرکت	\N	file	t	{files/WWM2807251466129.pdf}	2026-02-27 17:48:58.278	2026-02-27 17:48:58.278	\N	default_farnoosh_mashreq	\N
message415	2025-07-28 00:00:00	15:39	9000.00	AED	transfer	cmm56s17i00098oge2xb5or4t	Mashreq Bank	انتقال به حساب شرکت	\N	file	t	{files/WWM2807251466244.pdf}	2026-02-27 17:48:58.278	2026-02-27 17:48:58.278	\N	default_farnoosh_mashreq	\N
message417	2025-08-01 00:00:00	12:49	166.00	AED	expense	cmm56s17800028ogefz2eqqt0	Choithrams	CHOITHRAMS	\N	image	t	{photos/photo_208@01-08-2025_12-49-32.jpg}	2026-02-27 17:48:58.278	2026-02-27 17:48:58.278	\N	default_farnoosh_mashreq	\N
message423	2025-08-04 00:00:00	15:29	3.75	AED	expense	cmm56s17800028ogefz2eqqt0	Urban Fresh Mini Mart Co. LLC	سینا ۳.۷۵ درهم از سوپرمارکت پایین خونه سیب زمینی خریده رسیدشو نگرفته2nd August 01:25 PM	\N	image	t	{photos/photo_210@04-08-2025_15-29-58.jpg}	2026-02-27 17:48:58.278	2026-02-27 17:48:58.278	\N	default_farnoosh_mashreq	\N
message427	2025-08-04 00:00:00	15:41	54.50	AED	expense	cmm56s17900038ogeyynewip3	Dubai Taxi Corporation	\N	["Taxi ride (Hala Taxi, 20 km, from Deira to Sobha Creek Vistas Reserve)"]	image	t	{photos/photo_214@04-08-2025_15-41-02.jpg}	2026-02-27 17:48:58.278	2026-02-27 17:48:58.278	\N	default_farnoosh_mashreq	\N
message428	2025-08-04 00:00:00	15:41	54.50	AED	expense	cmm56s17900038ogeyynewip3	Hala Taxi	تاکسی از کلاب آریوس به خونه	["Taxi ride (20 km, 18 min, from BEST WESTERN PREMIER Deira Hotel to Sobha Creek Vistas Reserve)"]	image	t	{photos/photo_215@04-08-2025_15-41-02.jpg}	2026-02-27 17:48:58.278	2026-02-27 17:48:58.278	\N	default_farnoosh_mashreq	\N
message429	2025-08-04 00:00:00	15:45	125.90	AED	expense	cmm56s17800028ogefz2eqqt0	Choithrams	CHOITHRAMS	["Al Jazira Eggs White Family Pack 15.75","Rahma Pomace Olive Oil 500ml 19.50","Spring Onion 1.00","Kinder Maxi T1 21g 3.90","Nescafe 2in1 30x11.7g Sugar Free 3.00","Potato GCC 5.00","Onion Organic PP 32.95","G/F Coriander 100gm 1.25","G/F Mint Leaves 100gm 1.25","G/F Dill Leaves 100gm 1.25","Kiwi Italy Per Piece 13.50","Mushroom Local 250g 6.95","Red Radish Holland 125g 4.95","G/F Carrot 500g 3.95","Lettuce Fresh 2.45","Clementine Morocco 9.25"]	image	t	{photos/photo_216@04-08-2025_15-45-07.jpg}	2026-02-27 17:48:58.278	2026-02-27 17:48:58.278	\N	default_farnoosh_mashreq	\N
message431	2025-08-04 00:00:00	15:45	101.94	AED	expense	cmm56s17800028ogefz2eqqt0	Geant Express	Geant	["Sunbulah Green B 13.10","Tomato Round GCC 6.80","Peach Yellow Fle 25.23","Cabbage Red UAE 2.16","Quanta Ice Cream 4.15","London Diary Pra 7.40","Fresh Chicken Br 33.78","Watermelon GCC K 8.34"]	image	t	{photos/photo_217@04-08-2025_15-45-40.jpg}	2026-02-27 17:48:58.278	2026-02-27 17:48:58.278	\N	default_farnoosh_mashreq	\N
message433	2025-08-06 00:00:00	19:52	137.47	AED	expense	cmm56s17600018ogeqghk7vfb	Shaker Group Restauran	پیتزا از فست فود شاکر محلمون	["Pizza from fast food Shaker (neighborhood)"]	image	t	{photos/photo_218@06-08-2025_19-52-24.jpg}	2026-02-27 17:48:58.278	2026-02-27 17:48:58.278	\N	default_farnoosh_mashreq	\N
message409	2025-07-28 00:00:00	15:29	45.50	AED	expense	cmm56s17900038ogeyynewip3	Hala Taxi (Careem)	تاکسی از خونه به ایکیا	\N	image	t	{photos/photo_205@28-07-2025_15-29-21.jpg,photos/photo_204@28-07-2025_15-29-21.jpg}	2026-02-27 17:48:58.278	2026-02-28 08:38:13.19	\N	default_farnoosh_mashreq	\N
message411	2025-07-28 00:00:00	15:35	97.05	AED	expense	cmm5cqzf10001pw01d9pekwf0	IKEA	خرید از ایکیا	\N	image	t	{photos/photo_206@28-07-2025_15-35-27.jpg}	2026-02-27 17:48:58.278	2026-02-28 08:38:37.475	\N	default_farnoosh_mashreq	\N
message419	2025-08-01 00:00:00	12:50	281.90	AED	expense	cmm56s17800028ogefz2eqqt0	Carrefour (Dubai Festival City)	کارفور	\N	file	t	{files/76529258.pdf}	2026-02-27 17:48:58.278	2026-02-28 08:39:28.621	\N	default_farnoosh_mashreq	\N
message420	2025-08-01 00:00:00	12:50	\N	AED	expense	cmm56s17800028ogefz2eqqt0	\N	کارفور	\N	text	f	{}	2026-02-27 17:48:58.278	2026-02-28 08:39:28.621	message419	default_farnoosh_mashreq	\N
message421	2025-08-01 00:00:00	12:52	100.00	AED	expense	cmm56s17a00048ogeacrpia4x	du	شارژ du سیم کارت سینا	\N	image	t	{photos/photo_209@01-08-2025_12-52-47.jpg}	2026-02-27 17:48:58.278	2026-02-28 08:39:41.234	\N	default_farnoosh_mashreq	\N
message425	2025-08-04 00:00:00	15:31	50.50	AED	expense	cmm56s17900038ogeyynewip3	Hala Taxi (Careem)	تاکسی از خونه به کلاب آریوس شهرام شب‌پره	\N	image	t	{photos/photo_212@04-08-2025_15-31-52.jpg,photos/photo_211@04-08-2025_15-31-52.jpg}	2026-02-27 17:48:58.278	2026-02-28 08:40:10.156	\N	default_farnoosh_mashreq	\N
message426	2025-08-04 00:00:00	15:35	800.00	AED	expense	cmm56s17f00078oge3yf8pp6g	Arius Event Co LLC	شام و پذیرایی کلاب آریوس شهرام شب‌پره	\N	image	t	{photos/photo_213@04-08-2025_15-35-08.jpg}	2026-02-27 17:48:58.278	2026-02-28 08:40:27.915	\N	default_farnoosh_mashreq	\N
message434	2025-08-06 00:00:00	19:53	45.50	AED	expense	cmm56s17900038ogeyynewip3	Hala Taxi	تاکسی از خونه به کنسولگری ایران	["Taxi ride (14 km, 20 min, from Sobha Creek Vistas Reserve to Consulate General of The Islamic Republic of Iran, Jumeirah)"] | ["Taxi ride (from home to Consulate General of Iran)"]	image	t	{photos/photo_219@06-08-2025_19-53-24.jpg,photos/photo_220@06-08-2025_19-53-24.jpg}	2026-02-27 17:48:58.278	2026-02-28 08:40:51.434	\N	default_farnoosh_mashreq	\N
message436	2025-08-06 00:00:00	19:54	42.50	AED	expense	cmm56s17900038ogeyynewip3	Hala Taxi	تاکسی از کنسولگری ایران به مرکز بلهاسا الغوز	["Taxi ride (12 km, 22 min, from Consulate General of Iran to Belhasa Driving Center Al Qouz 4)"] | ["Taxi ride (from Iran Consulate to Belhasa Al Qouz)"]	image	t	{photos/photo_221@06-08-2025_19-54-31.jpg,photos/photo_222@06-08-2025_19-54-31.jpg}	2026-02-27 17:48:58.278	2026-02-28 08:41:04.713	\N	default_farnoosh_mashreq	\N
message438	2025-08-06 00:00:00	19:55	45.50	AED	expense	cmm56s17900038ogeyynewip3	Hala Taxi	تاکسی از بلهاسا الغوز به بلهاسا الوصل	["Taxi ride (16 km, 19 min, from Belhasa Driving Center Al Qouz 4 to Belhasa Driving Center Al Wasl Jaddaf Branch)"] | ["Taxi ride (from Belhasa Al Qouz to Belhasa Al Wasl)"]	image	t	{photos/photo_223@06-08-2025_19-55-20.jpg,photos/photo_224@06-08-2025_19-55-20.jpg}	2026-02-27 17:48:58.278	2026-02-28 08:43:03.011	\N	default_farnoosh_mashreq	\N
message622	2025-10-17 00:00:00	15:06	15.00	AED	expense	cmm5cqzf10001pw01d9pekwf0	Timegates Watches	خرید کابل برای ماشین	["car cable"]	image	t	{photos/photo_337@17-10-2025_15-06-39.jpg}	2026-02-27 17:48:58.342	2026-02-28 09:07:20.468	\N	default_farnoosh_mashreq	\N
message713	2025-11-15 00:00:00	23:53	269.00	AED	expense	cmm56s17g00088oge05l6cktv	\N	قسط سوم تامارا برای خرید کتونی جفتمون از اسکیچرزSkechersکتونی اسکیچرز هرکدوممون ۲۶۹ درهم - جمعا ۵۳۸ درهم	\N	image	t	{photos/photo_402@15-11-2025_23-53-55.jpg}	2026-02-27 17:48:58.411	2026-02-28 10:37:20.985	message712	default_farnoosh_mashreq	\N
cmm6fdwcs000e8o1shbrimwr8	2025-03-31 00:00:00	21:34	10.50	AED	expense	cmm56s17l000b8ogen8sv9jjw	OpenAI	۱۰.۵۰ درهم بابت خرید OPENAI	\N	\N	f	{}	2026-02-28 14:37:41.261	2026-02-28 14:37:41.261	\N	cmm6fbnk800008o9w89ze2ol6	\N
message443	2025-08-07 00:00:00	11:44	7.00	AED	expense	cmm56s17800028ogefz2eqqt0	\N	سینا ۷ درهم از سوپرمارکت پایین خونه نان خریده رسیدشو نگرفته7th August10:27 AM	\N	text	f	{}	2026-02-27 17:48:58.278	2026-02-27 17:48:58.278	\N	default_farnoosh_mashreq	\N
message448	2025-08-17 00:00:00	14:06	8.00	AED	expense	cmm56s17800028ogefz2eqqt0	\N	سینا ۸ درهم از سوپرمارکت پایین خونه نان خریده10th August12:00 AM	\N	text	f	{}	2026-02-27 17:48:58.278	2026-02-27 17:48:58.278	\N	default_farnoosh_mashreq	\N
message449	2025-08-17 00:00:00	14:06	7.50	AED	expense	cmm56s17800028ogefz2eqqt0	\N	سینا ۷.۵ درهم از سوپرمارکت پایین خونه سیب زمینی خریده10th August01:45 PM	\N	text	f	{}	2026-02-27 17:48:58.278	2026-02-27 17:48:58.278	\N	default_farnoosh_mashreq	\N
message450	2025-08-17 00:00:00	14:06	42.05	AED	expense	cmm56s17800028ogefz2eqqt0	Choithrams	CHOITHRAMS	["Potato GCC 3.25","Lemon South Africa 9.30","Cucumber 2.45","Carrot Australia 3.15","Coconut Hard India 3.25","Onion India 2.40","Banana Chiquita Ecuador 4.60","Kiwi Italy Per Piece 13.65"]	image	t	{photos/photo_227@17-08-2025_14-06-58.jpg}	2026-02-27 17:48:58.278	2026-02-27 17:48:58.278	\N	default_farnoosh_mashreq	\N
message452	2025-08-17 00:00:00	14:07	107.88	AED	expense	cmm56s17800028ogefz2eqqt0	Geant Express	Geant	["Sea Bass 400-600 25.40","Sea Bream 400-600 24.45","Celery Stick Spa 18.67","Capsicum Green N 8.10","Lettuce Romaine 4.16","Tomato Round GCC 5.02","Peach Flat PP 7.99","Pears Rosmerry S 8.03","Watermelon GCC K 7.86"]	image	t	{photos/photo_228@17-08-2025_14-07-18.jpg}	2026-02-27 17:48:58.278	2026-02-27 17:48:58.278	\N	default_farnoosh_mashreq	\N
message454	2025-08-17 00:00:00	14:14	192.74	AED	expense	cmm56s17800028ogefz2eqqt0	Carrefour	کارفور	["10 items delivered by Carrefour (subtotal 188.79, service fee 3.95)"]	image	t	{photos/photo_229@17-08-2025_14-14-59.jpg}	2026-02-27 17:48:58.278	2026-02-27 17:48:58.278	\N	default_farnoosh_mashreq	\N
message455	2025-08-17 00:00:00	14:36	31.00	AED	expense	cmm56s17900038ogeyynewip3	Hala Taxi	تاکسی از خونه به بلهاسا - امتحان آیین‌نامه	["Taxi ride (8 km, 12 min, from Sobha Creek Vistas Reserve to Belhasa Driving Center Al Wasl Jaddaf Branch) - driving license exam"]	image	t	{photos/photo_230@17-08-2025_14-36-24.jpg}	2026-02-27 17:48:58.278	2026-02-27 17:48:58.278	\N	default_farnoosh_mashreq	\N
message456	2025-08-17 00:00:00	14:36	29.50	AED	expense	cmm56s17900038ogeyynewip3	Hala Taxi	تاکسی از بلهاسا به خونه - امتحان آیین‌نامه	["Taxi ride (10 km, 12 min, from Belhasa Driving Center Al Wasl Jaddaf Branch to Sobha Creek Vistas Reserve) - driving license exam"]	image	t	{photos/photo_231@17-08-2025_14-36-47.jpg}	2026-02-27 17:48:58.278	2026-02-27 17:48:58.278	\N	default_farnoosh_mashreq	\N
message457	2025-08-17 00:00:00	14:37	27.50	AED	expense	cmm56s17900038ogeyynewip3	Hala Taxi	تاکسی از خونه به بلهاسا - اولین جلسه‌ی عملی	["Taxi ride (9 km, 10 min, from Sobha Creek Vistas Reserve to Belhasa Driving Center Al Wasl Jaddaf Branch) - first practical session"]	image	t	{photos/photo_232@17-08-2025_14-37-42.jpg}	2026-02-27 17:48:58.278	2026-02-27 17:48:58.278	\N	default_farnoosh_mashreq	\N
message458	2025-08-17 00:00:00	14:38	30.50	AED	expense	cmm56s17900038ogeyynewip3	Hala Taxi	تاکسی از بلهاسا به خونه - اولین جلسه‌ی عملی	["Taxi ride (10 km, 12 min, from Belhasa Driving Center Al Wasl Jaddaf Branch to Sobha Creek Vistas Reserve) - first practical session"]	image	t	{photos/photo_233@17-08-2025_14-38-04.jpg}	2026-02-27 17:48:58.278	2026-02-27 17:48:58.278	\N	default_farnoosh_mashreq	\N
message459	2025-08-17 00:00:00	14:39	8.75	AED	expense	cmm56s17800028ogefz2eqqt0	\N	از سوپرمارکت پایین خونه ۸.۷۵ درهم نون باگت و دلستر خریدیم16th August03:00 PM	\N	text	f	{}	2026-02-27 17:48:58.278	2026-02-27 17:48:58.278	\N	default_farnoosh_mashreq	\N
message461	2025-08-17 00:00:00	14:43	186.00	AED	expense	cmm56s17600018ogeqghk7vfb	Allo Beirut Restaurant LLC	رستوران الو بیروت با نگین اینا۸۸ درهمش مال اوناست۹۸ درهم مال ماست	["Arabic Beef Shawarma - AED 42.0","Arabic Chicken Shawarma - x2 - AED 80.0","Lemonade With Mint Juice - AED 20.0","Pepsi - AED 9.0","Em Ali - AED 35.0","VAT 5% - AED 8.86"]	image	t	{photos/photo_235@17-08-2025_14-43-33.jpg}	2026-02-27 17:48:58.278	2026-02-27 17:48:58.278	\N	default_farnoosh_mashreq	\N
message466	2025-08-20 00:00:00	12:01	26.50	AED	expense	cmm56s17900038ogeyynewip3	Hala Taxi (Careem)	\N	["Taxi ride - Home to Belhasa Driving Center (9 km, 8 min) - AED 26.5"]	image	t	{photos/photo_240@20-08-2025_12-01-55.jpg}	2026-02-27 17:48:58.278	2026-02-27 17:48:58.278	\N	default_farnoosh_mashreq	\N
message467	2025-08-20 00:00:00	12:01	26.50	AED	expense	cmm56s17900038ogeyynewip3	Dubai Taxi Corporation	تاکسی از خونه به بلهاسا - جلسه شب سینا	["Taxi ride - Home to Belhasa (card payment via Mashreq Visa) - AED 26.5"]	image	t	{photos/photo_241@20-08-2025_12-01-55.jpg}	2026-02-27 17:48:58.278	2026-02-27 17:48:58.278	\N	default_farnoosh_mashreq	\N
message440	2025-08-06 00:00:00	19:56	1.00	AED	expense	cmm56s17a00048ogeacrpia4x	\N	۱ درهم برای اد کردن کارت تبی به اپل پی از حسابم کم شده6th August 01:34 PM	\N	text	f	{}	2026-02-27 17:48:58.278	2026-02-28 08:43:20.478	\N	default_farnoosh_mashreq	\N
message442	2025-08-06 00:00:00	19:57	30.50	AED	expense	cmm56s17900038ogeyynewip3	Dubai Taxi Corporation	\N	["Taxi ride (from Belhasa Al Wasl to home)"]	image	t	{photos/photo_226@06-08-2025_19-57-09.jpg}	2026-02-27 17:48:58.278	2026-02-28 08:43:49.393	message441	default_farnoosh_mashreq	\N
message460	2025-08-17 00:00:00	14:41	11.60	AED	expense	cmm56s17f00078oge3yf8pp6g	Lime	اجاره اسکوتر	["Scooter rental - Start Fee - AED 2.8","Riding - 0.80/min (11 min) - AED 8.8","VAT 5% - AED 0.55"]	image	t	{photos/photo_234@17-08-2025_14-41-51.jpg}	2026-02-27 17:48:58.278	2026-02-28 08:45:14.361	\N	default_farnoosh_mashreq	\N
message462	2025-08-19 00:00:00	18:58	27.00	AED	expense	cmm56s17900038ogeyynewip3	Hala Taxi (Careem)	تاکسی از خونه به بلهاسا - دومین جلسه‌ی عملی	["Taxi ride - Home to Belhasa Driving Center (9 km, 12 min) - AED 27.0"] | ["Taxi ride - Home to Belhasa (card payment via Mashreq Visa) - AED 27.0"]	image	t	{photos/photo_236@19-08-2025_18-58-35.jpg,photos/photo_237@19-08-2025_18-58-35.jpg}	2026-02-27 17:48:58.278	2026-02-28 08:45:26.464	\N	default_farnoosh_mashreq	\N
message464	2025-08-19 00:00:00	18:58	30.00	AED	expense	cmm56s17900038ogeyynewip3	Hala Taxi (Careem)	تاکسی از بلهاسا به خونه - دومین جلسه‌ی عملی	["Taxi ride - Belhasa to Home (10 km, 13 min) - AED 30.0"] | ["Taxi ride - Belhasa to Home (card payment via Mashreq Visa) - AED 30.0"]	image	t	{photos/photo_238@19-08-2025_18-58-55.jpg,photos/photo_239@19-08-2025_18-58-55.jpg}	2026-02-27 17:48:58.278	2026-02-28 08:46:50.058	\N	default_farnoosh_mashreq	\N
message468	2025-08-20 00:00:00	12:02	36.50	AED	expense	cmm56s17900038ogeyynewip3	Hala Taxi (Careem)	تاکسی از بلهاسا به خونه - جلسه شب سینا	["Taxi ride - Belhasa to Home (12 km, 16 min) - AED 36.5"]	image	t	{photos/photo_242@20-08-2025_12-02-52.jpg}	2026-02-27 17:48:58.278	2026-02-27 17:48:58.278	\N	default_farnoosh_mashreq	\N
message469	2025-08-20 00:00:00	12:13	284.05	AED	expense	cmm56s17800028ogefz2eqqt0	Choithrams	CHOITHRAMS	["Heinz Tomato Paste 300g - AED 9.5","Kiri Greek Style Tub Cheese 200g - AED 14.25","Little Moons Passion Mango Mochi 192g - AED 42.5","Reef High Protein Bread Hlthy Bread 25 - AED 22.95","Capsicum Green Local Pack of 3 - AED 6.95","Cucumber Organic PP - AED 7.95","Lemon South Africa - AED 5.55","Banana Chiquita Equador - AED 4.35","Tomato Fresh - AED 3.85","Lettuce Fresh - AED 3.15","Plum Red South Africa - AED 4.65","Peaches Amjeeeh Spain - AED 26.55","Grapefruit Turkey - AED 6.95","Mushroom Local 250g - AED 23.95","Raspberry USA 170g - AED 23.25","Nivea D/Spray Fresh Men 481618 - AED 15.0","Al Shifa Honey Natural 125g - AED 15.95","Magnum Classic 100ml - AED 8.5","Loacker Cream Cone Strawberry 140ml - AED 4.25","Potato 602 - AED 8.1","Clementine Morocco - AED 4.95","Carrot Australia - AED 4.95","Kiwi New Zealand Per Piece - AED 20.65","Tax Amount (VAT) - AED 13.53"]	image	t	{photos/photo_243@20-08-2025_12-13-21.jpg}	2026-02-27 17:48:58.278	2026-02-27 17:48:58.278	\N	default_farnoosh_mashreq	\N
message471	2025-08-21 00:00:00	16:33	28.00	AED	expense	cmm56s17900038ogeyynewip3	Hala Taxi (Careem)	تاکسی از خونه به بلهاسا - سومین جلسه‌ی عملی	["Taxi ride - Home to Belhasa Driving Center (9 km, 12 min) - AED 28.0"]	image	t	{photos/photo_244@21-08-2025_16-33-47.jpg}	2026-02-27 17:48:58.278	2026-02-27 17:48:58.278	\N	default_farnoosh_mashreq	\N
message472	2025-08-21 00:00:00	16:33	28.00	AED	expense	cmm56s17900038ogeyynewip3	Arabia Taxi	\N	["Taxi ride - Home to Belhasa (card payment via Mashreq Visa) - AED 28.0"]	image	t	{photos/photo_245@21-08-2025_16-33-47.jpg}	2026-02-27 17:48:58.278	2026-02-27 17:48:58.278	\N	default_farnoosh_mashreq	\N
message473	2025-08-21 00:00:00	16:34	26.00	AED	expense	cmm56s17900038ogeyynewip3	Dubai Taxi Corporation	تاکسی از بلهاسا به خونه - سومین جلسه‌ی عملیاز همون جلو آموزشگاه تاکسی گرفتیم	["Taxi ride - Belhasa to Home (card payment via Mashreq Visa) - AED 26.0"]	image	t	{photos/photo_246@21-08-2025_16-34-31.jpg}	2026-02-27 17:48:58.278	2026-02-27 17:48:58.278	\N	default_farnoosh_mashreq	\N
message474	2025-08-22 00:00:00	21:57	15.50	AED	expense	cmm56s17800028ogefz2eqqt0	\N	سینا از سوپرمارکت پایین خونه ۱۵.۵۰ درهم نخ دندون خرید22th August09:54 PM	\N	text	f	{}	2026-02-27 17:48:58.278	2026-02-27 17:48:58.278	\N	default_farnoosh_mashreq	\N
message475	2025-08-23 00:00:00	15:22	27.50	AED	expense	cmm56s17900038ogeyynewip3	Hala Taxi (Careem)	تاکسی از خونه به بلهاسا - چهارمین جلسه‌ی عملی	["Taxi ride - Home to Belhasa Driving Center (8 km, 15 min) - AED 27.5"]	image	t	{photos/photo_247@23-08-2025_15-22-25.jpg}	2026-02-27 17:48:58.278	2026-02-27 17:48:58.278	\N	default_farnoosh_mashreq	\N
message476	2025-08-23 00:00:00	15:22	30.50	AED	expense	cmm56s17900038ogeyynewip3	Hala Taxi (Careem)	تاکسی از بلهاسا به خونه - چهارمین جلسه‌ی عملی۳۱.۱۰ درهم شد	["Taxi ride - Belhasa to Home (10 km, 12 min) - AED 30.5"]	image	t	{photos/photo_248@23-08-2025_15-22-50.jpg}	2026-02-27 17:48:58.278	2026-02-27 17:48:58.278	\N	default_farnoosh_mashreq	\N
message478	2025-08-25 00:00:00	14:49	307.51	AED	expense	cmm56s17800028ogefz2eqqt0	Carrefour	کارفور	["Grocery order (13 items) via Carrefour - AED 307.51"]	image	t	{photos/photo_249@25-08-2025_14-49-38.jpg}	2026-02-27 17:48:58.278	2026-02-27 17:48:58.278	\N	default_farnoosh_mashreq	\N
message479	2025-08-25 00:00:00	14:59	27.00	AED	expense	cmm56s17900038ogeyynewip3	Hala Taxi (Careem)	تاکسی از خونه به بلهاسا - امتحان road assessment test	["Taxi ride - Home to Belhasa Driving Center (9 km, 14 min) - AED 27.0"]	image	t	{photos/photo_250@25-08-2025_14-59-31.jpg}	2026-02-27 17:48:58.278	2026-02-27 17:48:58.278	\N	default_farnoosh_mashreq	\N
message480	2025-08-25 00:00:00	14:59	126.00	AED	expense	cmm56s17m000c8ogerjdoev6e	Belhasa Driving Center LLC	\N	["Extension Class Charges (Light Motor Vehicle Auto-20 Regular) - AED 120.0","VAT 5% - AED 6.0"]	file	t	{files/DIRPPaymentReceipt.pdf}	2026-02-27 17:48:58.278	2026-02-27 17:48:58.278	\N	default_farnoosh_mashreq	\N
message482	2025-08-25 00:00:00	15:01	\N	AED	expense	cmm56s17m000c8ogerjdoev6e	\N	پرداخت هزینه اضافی برای کلاس جلسه آخر سینا - highway & independent session	\N	text	f	{}	2026-02-27 17:48:58.278	2026-02-27 17:48:58.278	\N	default_farnoosh_mashreq	\N
message483	2025-08-25 00:00:00	15:07	30.00	AED	expense	cmm56s17900038ogeyynewip3	Hala Taxi (Careem)	تاکسی از بلهاسا به خونه - امتحان road assessment test۳۱.۱۰ درهم شد	["Taxi ride - Belhasa to Home (10 km, 15 min) - AED 30.0"]	image	t	{photos/photo_251@25-08-2025_15-07-50.jpg}	2026-02-27 17:48:58.278	2026-02-27 17:48:58.278	\N	default_farnoosh_mashreq	\N
message484	2025-08-26 00:00:00	17:51	286.25	AED	expense	cmm56s17800028ogefz2eqqt0	Choithrams	CHOITHRAMS	["Nawanin Baby Cucumber Pickle 700g","Figaro Plain Green Olives 340g","Bertolli Extra Virgin Olive Oil 750ml","Alpro Drink Oat Almond 1L","Mogu Mogu Juice Strawberry 320ml","Reef Oats Bread 250g","V8 Demi Baguette Sesame Seeds 125g","Celery Organic PP","Broccoli Spain 1 PC","G/F Parsley Leaves 100g","Nectarine South Africa","Avocado Ready to Eat","Onion White Spain","Apple Green France","Beans Green","Passion Fruit Kenya","Mango Pakistan","Tomato Fresh","Cucumber Organic PP","Banana Chiquita Ecuador","VB Pandisal 4x5"]	image	t	{photos/photo_252@26-08-2025_17-51-58.jpg}	2026-02-27 17:48:58.278	2026-02-27 17:48:58.278	\N	default_farnoosh_mashreq	\N
message487	2025-08-26 00:00:00	17:54	6.75	AED	expense	cmm56s17800028ogefz2eqqt0	\N	از Geant نان ۶.۷۵ درهم خریدیم25th August07:07 PM	\N	text	f	{}	2026-02-27 17:48:58.278	2026-02-27 17:48:58.278	\N	default_farnoosh_mashreq	\N
message488	2025-08-26 00:00:00	17:55	20.00	AED	expense	cmm56s17900038ogeyynewip3	Careem	تاکسی از سوپر مارکت Geant به خونه۲۱ درهم شد	["Comfort ride - Sobha Hartland to Sobha Creek Vistas Reserve"]	image	t	{photos/photo_253@26-08-2025_17-55-45.jpg}	2026-02-27 17:48:58.278	2026-02-27 17:48:58.278	\N	default_farnoosh_mashreq	\N
message489	2025-08-26 00:00:00	17:59	27.00	AED	expense	cmm56s17900038ogeyynewip3	Careem	تاکسی از خونه به بلهاسا - پنجمین جلسه‌ی عملی فرنوش	["Hala Taxi ride - Sobha Creek Vistas Reserve to Belhasa Driving Center"]	image	t	{photos/photo_254@26-08-2025_17-59-55.jpg}	2026-02-27 17:48:58.278	2026-02-27 17:48:58.278	\N	default_farnoosh_mashreq	\N
message490	2025-08-26 00:00:00	18:01	31.00	AED	expense	cmm56s17900038ogeyynewip3	Careem	تاکسی از بلهاسا به خونه - پنجمین جلسه‌ی عملی فرنوش۳۱.۱۰ درهم شد	["Hala Taxi ride - Belhasa Driving Center to Sobha Creek Vistas Reserve"]	image	t	{photos/photo_255@26-08-2025_18-01-08.jpg}	2026-02-27 17:48:58.278	2026-02-27 17:48:58.278	\N	default_farnoosh_mashreq	\N
message716	2025-11-15 00:00:00	23:58	76.33	AED	expense	cmm56s17g00088oge05l6cktv	Tabby	\N	3rd installment payment	image	t	{photos/photo_405@15-11-2025_23-58-12.jpg}	2026-02-27 17:48:58.411	2026-02-28 10:38:49.682	message717	default_farnoosh_mashreq	\N
message494	2025-08-26 00:00:00	19:24	100.00	AED	expense	cmm56s17800028ogefz2eqqt0	\N	العین رو ۱۰۰ درهم شارژ کردیم26th August07:18 PM	\N	text	f	{}	2026-02-27 17:48:58.278	2026-02-27 17:48:58.278	\N	default_farnoosh_mashreq	\N
message495	2025-08-26 00:00:00	19:24	100.00	AED	expense	cmm56s17a00048ogeacrpia4x	du	شارژ سیم کارت du سینا	["SIM card recharge - du (971551507311)"]	image	t	{photos/photo_256@26-08-2025_19-24-43.jpg}	2026-02-27 17:48:58.278	2026-02-27 17:48:58.278	\N	default_farnoosh_mashreq	\N
message496	2025-08-27 00:00:00	21:29	27.50	AED	expense	cmm56s17900038ogeyynewip3	Careem	تاکسی از خونه به بلهاسا - پنجمین جلسه‌ی عملی سینا	["Hala Taxi ride - Sobha Creek Vistas Reserve to Belhasa Driving Center"]	image	t	{photos/photo_257@27-08-2025_21-29-05.jpg}	2026-02-27 17:48:58.278	2026-02-27 17:48:58.278	\N	default_farnoosh_mashreq	\N
message497	2025-08-27 00:00:00	21:29	38.00	AED	expense	cmm56s17900038ogeyynewip3	Careem	تاکسی از بلهاسا به خونه - پنجمین جلسه‌ی عملی سینا	["Hala Taxi ride - Belhasa Driving Center to Sobha Creek Vistas Reserve"]	image	t	{photos/photo_258@27-08-2025_21-29-18.jpg}	2026-02-27 17:48:58.278	2026-02-27 17:48:58.278	\N	default_farnoosh_mashreq	\N
message498	2025-08-27 00:00:00	21:32	243.00	AED	expense	cmm56s17600018ogeqghk7vfb	Rivas	سفارش غذا از ریواس	["Ash Reshteh: 30.00","Mixed Kabab (1 Koobideh + 1 Chicken Kabab): 90.00","Kateh Fesenjan Chicken: 80.00","Ash Doogh: 35.00","Delivery Fee: 8.00"]	image	t	{photos/photo_259@27-08-2025_21-32-49.jpg}	2026-02-27 17:48:58.278	2026-02-27 17:48:58.278	\N	default_farnoosh_mashreq	\N
message505	2025-08-31 00:00:00	11:39	168.00	AED	expense	cmm56s17g00088oge05l6cktv	717 Gents Salon	سینا ۱۶۸ درهم آرایشگاه پایین خونه مو و ریش‌هاشو کوتاه کرده29th August06:04 PM	["Haircut and beard trim"]	image	t	{photos/photo_264@31-08-2025_11-39-58.jpg}	2026-02-27 17:48:58.278	2026-02-27 17:48:58.278	\N	default_farnoosh_mashreq	\N
message506	2025-08-31 00:00:00	11:40	88.00	AED	expense	cmm56s17f00078oge3yf8pp6g	Viragrp Llcfz	۸۸ درهم با نگین اینا تو سینما پاپ کرن و ساندویچ خریدیم برای پیرپسر۵۵ درهم برای نگین ایناست۳۳ درهم برای ماست29th August08:05 PM	["Cinema snacks - popcorn and sandwich (33 AED own share, 55 AED for friends)"]	image	t	{photos/photo_265@31-08-2025_11-40-08.jpg}	2026-02-27 17:48:58.278	2026-02-27 17:48:58.278	\N	default_farnoosh_mashreq	\N
message507	2025-08-31 00:00:00	11:41	16.64	AED	expense	cmm56s17800028ogefz2eqqt0	Geant	سینا ۱۶.۶۴ درهم نون از Geant خریده30th August 08:15 AM	["Bread"]	image	t	{photos/photo_266@31-08-2025_11-41-32.jpg}	2026-02-27 17:48:58.278	2026-02-27 17:48:58.278	\N	default_farnoosh_mashreq	\N
message512	2025-09-02 00:00:00	17:03	94.50	AED	expense	cmm56s17600018ogeqghk7vfb	Roasters Specialty Coffee House Sobha Hartland	با سینا رفتیم کافه‌ی نزدیک خونه1st September 08:19 PM	["Cafe visit at Roasters Specialty Coffee House"]	image	t	{photos/photo_267@02-09-2025_17-03-22.jpg}	2026-02-27 17:48:58.278	2026-02-27 17:48:58.278	\N	default_farnoosh_mashreq	\N
message515	2025-09-02 00:00:00	17:05	126.00	AED	expense	cmm56s17900038ogeyynewip3	Belhasa Driving Center	هزینه یک جلسه اضافه فرنوش برای تمرین پارک	["Additional 2 Classes (parking practice session for Farnoosh) - 120.00 + VAT 6.00"]	file	t	{"files/DIRPPaymentReceipt (1).pdf"}	2026-02-27 17:48:58.278	2026-02-27 17:48:58.278	\N	default_farnoosh_mashreq	\N
message516	2025-09-02 00:00:00	17:05	293.50	AED	expense	cmm56s17900038ogeyynewip3	Belhasa Driving Center	هزینه رزرو مجدد امتحان RTA Yard Test فرنوش	["Practical Yard Test To Obtain A Driver's License (RTA fee) - 220.00","Test Vehicle Rent Fee - Yard (BDC fee) - 70.00 + VAT 3.50"]	file	t	{"files/DIRPPaymentReceipt (1) (1).pdf"}	2026-02-27 17:48:58.278	2026-02-27 17:48:58.278	\N	default_farnoosh_mashreq	\N
message499	2025-08-28 00:00:00	19:43	31.50	AED	expense	cmm56s17900038ogeyynewip3	Careem	تاکسی از خونه به بلهاسا - امتحان yard assessment test	["Hala Taxi ride - Sobha Creek Vistas Reserve to Belhasa Driving Center"] | ["Apple Pay card transaction at Cars Taxi, Dubai"]	image	t	{photos/photo_260@28-08-2025_19-43-53.jpg,photos/photo_261@28-08-2025_19-43-53.jpg}	2026-02-27 17:48:58.278	2026-02-28 08:48:03.928	\N	default_farnoosh_mashreq	\N
message501	2025-08-28 00:00:00	19:44	35.00	AED	expense	cmm56s17900038ogeyynewip3	Careem	تاکسی از بلهاسا به خونه - امتحان yard assessment test	["Hala Taxi ride - Belhasa Driving Center to Sobha Creek Vistas Reserve"] | ["Apple Pay card transaction at Cars Taxi, Dubai"]	image	t	{photos/photo_262@28-08-2025_19-44-01.jpg,photos/photo_263@28-08-2025_19-44-01.jpg}	2026-02-27 17:48:58.278	2026-02-28 08:48:27.913	\N	default_farnoosh_mashreq	\N
message508	2025-09-01 00:00:00	10:37	8000.00	AED	income	cmm56s17i00098oge2xb5or4t	Mashreq Bank	کارت به کارت سینا به فرنوش - ۸۰۰۰ درهم	["Fund transfer from Sina Ghadri to Farnoosh Bagheri - Family Support"]	file	t	{files/MWM3108252233933.PDF}	2026-02-27 17:48:58.278	2026-02-28 08:49:08.535	\N	default_farnoosh_mashreq	\N
message509	2025-09-01 00:00:00	10:37	8000.00	AED	income	cmm56s17i00098oge2xb5or4t	\N	کارت به کارت سینا به فرنوش - ۸۰۰۰ درهم	\N	text	f	{}	2026-02-27 17:48:58.278	2026-02-28 08:49:08.535	message508	default_farnoosh_mashreq	\N
message510	2025-09-01 00:00:00	10:38	251.83	AED	expense	cmm5cqzf10001pw01d9pekwf0	Amazon.ae	خرید از آمازونamazon	["PROIRON Resistance Loop Bands Set of 5: 35.99","Bone China Shallow Moire 4-Piece Mugs Set: 16.86","BLACK+DECKER Glass Chopper & Mincer 400W: 85.00","Yoga Mat with Bag and Carrying Strap 10mm: 38.99","Dettol Skincare Liquid Handwash Refill 1L x 2: 44.99","Oral-B CrissCross Gum Care Toothbrush 4N: 18.86","MOMENT 4 Pack Loofah Bath Sponge: 11.14"]	file	t	{"files/Order Details.pdf"}	2026-02-27 17:48:58.278	2026-02-28 08:49:26.018	\N	default_farnoosh_mashreq	\N
message513	2025-09-02 00:00:00	17:03	27.50	AED	expense	cmm56s17900038ogeyynewip3	Hala Taxi (Careem)	تاکسی از خونه به بلهاسا - RTA Yard Test	["Taxi ride from home (Sobha Creek Vistas Reserve) to Belhasa Driving Center (Al Jaddaf) - RTA Yard Test"] | ["Taxi ride from home to Belhasa - RTA Yard Test (Apple Wallet / Mashreq Visa Debit confirmation)"]	image	t	{photos/photo_268@02-09-2025_17-03-51.jpg,photos/photo_269@02-09-2025_17-03-51.jpg}	2026-02-27 17:48:58.278	2026-02-28 08:49:37.244	\N	default_farnoosh_mashreq	\N
message517	2025-09-02 00:00:00	17:10	30.00	AED	expense	cmm56s17900038ogeyynewip3	Hala Taxi	تاکسی از بلهاسا به خونه - RTA Yard Test	["Taxi ride from Belhasa Driving Center (Al Jaddaf) to home (Sobha Creek Vistas Reserve) - RTA Yard Test"] | ["Taxi ride from Belhasa to home - RTA Yard Test (Apple Wallet / Mashreq Visa Debit confirmation)"]	image	t	{photos/photo_270@02-09-2025_17-10-38.jpg,photos/photo_271@02-09-2025_17-10-38.jpg}	2026-02-27 17:48:58.278	2026-02-28 08:50:06.999	\N	default_farnoosh_mashreq	\N
message518	2025-09-02 00:00:00	17:10	30.00	AED	expense	cmm56s17900038ogeyynewip3	Metro Taxi	تاکسی از بلهاسا به خونه - RTA Yard Test	["Taxi ride from Belhasa to home - RTA Yard Test (Apple Wallet / Mashreq Visa Debit confirmation)"]	image	t	{photos/photo_271@02-09-2025_17-10-38.jpg}	2026-02-27 17:48:58.278	2026-02-28 08:50:06.999	message517	default_farnoosh_mashreq	\N
message521	2025-09-02 00:00:00	17:31	27.50	AED	expense	cmm56s17800028ogefz2eqqt0	Loftday Market	خرید از سوپرمارکت پایین خونه	["Al Arz Medium Lebanese Brown Bread (5 pieces) - 2.00","Golden Eggs Medium Grade A White Eggs - 16.00","Energizer 1.5V AAA Alkaline Power Batteries - 9.50"]	image	t	{photos/photo_272@02-09-2025_17-31-24.jpg}	2026-02-27 17:48:58.278	2026-02-27 17:48:58.278	\N	default_farnoosh_mashreq	\N
message532	2025-09-06 00:00:00	18:37	293.50	AED	expense	cmm56s17m000c8ogerjdoev6e	Belhasa Driving Center	هزینه رزرو مجدد امتحان RTA Yard Test فرنوش	["Practical Yard Test To Obtain A Driver's License (RTA fee) - 220.00","Test Vehicle Rent Fee - Yard (BDC fee) - 70.00 + VAT 3.50"]	file	t	{"files/DIRPPaymentReceipt (3).pdf"}	2026-02-27 17:48:58.342	2026-02-28 10:41:24.862	\N	default_farnoosh_mashreq	\N
cmm6fdwd1000i8o1szahmyioj	2025-04-07 00:00:00	13:13	5.25	AED	expense	cmm56s17800028ogefz2eqqt0	سوپرمارکت لیمو	سینا ۵.۲۵ درهم از سوپرمارکت لیمو خرید کرده رسیدشو نگرفته	\N	\N	f	{}	2026-02-28 14:37:41.27	2026-02-28 14:37:41.27	\N	cmm6fbnk800008o9w89ze2ol6	\N
message526	2025-09-06 00:00:00	18:17	30.50	AED	expense	cmm56s17900038ogeyynewip3	Hala Taxi	تاکسی از بلهاسا به خونه - امتحان RTA Road Test سینا۳۱.۱۰ درهم شد	["Taxi ride from Belhasa Driving Center (Al Jaddaf) to home (Sobha Creek Vistas Reserve) - RTA Road Test Sina"]	image	t	{photos/photo_275@06-09-2025_18-17-10.jpg}	2026-02-27 17:48:58.278	2026-02-27 17:48:58.278	\N	default_farnoosh_mashreq	\N
message529	2025-09-06 00:00:00	18:28	31.50	AED	expense	cmm56s17900038ogeyynewip3	Hala Taxi	تاکسی از خونه به بلهاسا فرنوش - جلسه تمرین پارک و امتحان RTA Yard Test فرنوش بار دوم	["Taxi ride from home (Sobha Creek Vistas Reserve) to Belhasa Driving Center (Al Jaddaf) - Farnoosh parking practice and RTA Yard Test 2nd attempt"]	image	t	{photos/photo_277@06-09-2025_18-28-07.jpg}	2026-02-27 17:48:58.278	2026-02-27 17:48:58.278	\N	default_farnoosh_mashreq	\N
message533	2025-09-06 00:00:00	18:40	33.00	AED	expense	cmm56s17900038ogeyynewip3	Hala Taxi	تاکسی از بلهاسا به خونه - جلسه اضافه اول سینا و امتحان RTA Yard Test فرنوش	["Taxi ride from Belhasa Driving Center (Al Jaddaf) to home (Sobha Creek Vistas Reserve) - Sina extra lesson 1 and Farnoosh RTA Yard Test"]	image	t	{photos/photo_280@06-09-2025_18-40-19.jpg}	2026-02-27 17:48:58.342	2026-02-27 17:48:58.342	\N	default_farnoosh_mashreq	\N
message534	2025-09-06 00:00:00	18:48	259.00	AED	expense	cmm56s17800028ogefz2eqqt0	Seyed Kazem Mirjalili General Trading	خرید میوه از سید کاظم میرجلیلی	["Zalzalak - 25.09","Nectarine Shams KG - 15.09","Cornelian Cherry (Pak) - 9.52","Fresh Pistachio IRI KG - 35.34","Fig Iran Black - 15.09","Peach IRI KG - 10.09","Baharestan Mint Distillate 500g - 4.76","Sweet Chilli IRI - 7.98","Herang Tahini 350g - 11.43","Tabiat Tuna Fish in Brine - 7.62","Dameshagh Sonaati Kashk 480g - 9.52","Tabiat Tomato Paste 400g - 3.81","Delpazir Thousand Island 450g - 8.57","Kalleh Asgel Dogoi 1.5L - 11.43","Frozen Kookoo Sabzi 400g - 15.33","Frozen Sabzi Ghormeh 400g - 22.86","Kalleh ProYogurt Icelandic 400 - 9.52","Cabbage Red KG - 4.76","Alis Mint (1.5L) - 9.52"]	image	t	{photos/photo_281@06-09-2025_18-48-39.jpg}	2026-02-27 17:48:58.342	2026-02-27 17:48:58.342	\N	default_farnoosh_mashreq	\N
message536	2025-09-06 00:00:00	18:49	348.26	AED	expense	cmm56s17800028ogefz2eqqt0	Geant Express (GMG Consumer LLC)	Geant	["Avocado Ready To - 17.95","Avocado Ready To - 8.10","Lusine Multi Gra - 35.70","Sensodyne Adv Re - 28.15","Barilla Pasta Pe - 7.40","London Diary Str - 11.50","Puck Cream Chees (1.018 qty) - 47.80","Sea Bream 400-600 - 42.25","Magnum Classic (0.925 qty) - 7.35","Banana Chiquita (1.223 qty) - 4.83","Onion Red India (0.771 qty) - 4.59","Carrot Australia (0.82 qty) - 8.23","Lemon South Afri (0.744 qty) - 17.07","Celery Stick Spa (0.894 qty) - 4.82","Lettuce Romaine - 8.95","Jenan XLarge Whi - 7.95","Mushroom White O - 24.25","Mother Earth Pea - 5.10","Kinder Milk Choc - 11.95","Bread Kraftkorn (0.816 qty) - 48.32"]	image	t	{photos/photo_282@06-09-2025_18-49-28.jpg}	2026-02-27 17:48:58.342	2026-02-27 17:48:58.342	\N	default_farnoosh_mashreq	\N
message623	2025-10-17 00:00:00	15:07	3.00	AED	expense	cmm56s17800028ogefz2eqqt0	Royal Corn Foodstuff T	توی oasis mall آب خریدیم	["water"]	image	t	{photos/photo_338@17-10-2025_15-07-31.jpg}	2026-02-27 17:48:58.342	2026-02-27 17:48:58.342	\N	default_farnoosh_mashreq	\N
message522	2025-09-06 00:00:00	18:12	31.00	AED	expense	cmm56s17900038ogeyynewip3	Hala Taxi (Careem)	تاکسی از خونه به بلهاسا - امتحان RTA Road Test سینا	["Taxi ride from home (Sobha Creek Vistas Reserve) to Belhasa Driving Center (Al Jaddaf) - RTA Road Test Sina"] | ["Taxi ride from home to Belhasa - RTA Road Test Sina (Apple Wallet / Mashreq Visa Debit confirmation, 9/3/25)"]	image	t	{photos/photo_273@06-09-2025_18-12-08.jpg,photos/photo_274@06-09-2025_18-12-08.jpg}	2026-02-27 17:48:58.278	2026-02-28 08:50:23.048	\N	default_farnoosh_mashreq	\N
message524	2025-09-06 00:00:00	18:14	797.50	AED	expense	cmm56s17m000c8ogerjdoev6e	Belhasa Driving Center	هزینه دو جلسه اضافه سینا بعد از افتادن در امتحان RTA Road Test+رزرو مجدد آزمون	["Practical Road Test To Obtain A Driver's License (RTA fee) - 220.00","Test Vehicle Rent Fee - Road (BDC fee) - 70.00 + VAT 3.50","Extension Class Charges - 480.00 + VAT 24.00"]	file	t	{"files/DIRPPaymentReceipt (2).pdf"}	2026-02-27 17:48:58.278	2026-02-28 08:51:15.88	\N	default_farnoosh_mashreq	\N
message525	2025-09-06 00:00:00	18:15	\N	AED	expense	cmm56s17m000c8ogerjdoev6e	\N	هزینه دو جلسه اضافه سینا بعد از افتادن در امتحان RTA Road Test+رزرو مجدد آزمون	\N	text	f	{}	2026-02-27 17:48:58.278	2026-02-28 08:51:15.88	message524	default_farnoosh_mashreq	\N
message530	2025-09-06 00:00:00	18:33	27.50	AED	expense	cmm56s17900038ogeyynewip3	Hala Taxi (CarsTaxi)	تاکسی از خونه به بلهاسا سینا - جلسه اضافه اول سینا بعد از افتادن در امتحان RTA Road Test	["Taxi ride from home (Sobha Creek Vistas Reserve) to Belhasa Driving Center (Al Jaddaf) - Sina extra lesson 1 after failing RTA Road Test"] | ["Taxi ride from home to Belhasa - Sina extra lesson 1 (Apple Wallet / Mashreq Visa Debit confirmation, 9/4/25)"]	image	t	{photos/photo_278@06-09-2025_18-33-37.jpg,photos/photo_279@06-09-2025_18-33-37.jpg}	2026-02-27 17:48:58.342	2026-02-28 08:51:39.131	\N	default_farnoosh_mashreq	\N
message538	2025-09-06 00:00:00	18:53	27.50	AED	expense	cmm56s17900038ogeyynewip3	Careem (Hala Taxi)	تاکسی از خونه به بلهاسا - جلسه اضافه دوم سینا	["Hala Taxi ride, 9 km, Sobha Creek Vistas Reserve to Belhasa Driving Center"] | ["Bank confirmation of CarsTaxi charge via Mashreq Visa Debit Platinum Card"]	image	t	{photos/photo_283@06-09-2025_18-53-55.jpg,photos/photo_284@06-09-2025_18-53-55.jpg}	2026-02-27 17:48:58.342	2026-02-28 08:52:00.022	\N	default_farnoosh_mashreq	\N
message539	2025-09-06 00:00:00	18:53	27.50	AED	expense	cmm56s17900038ogeyynewip3	CarsTaxi	\N	["Bank confirmation of CarsTaxi charge via Mashreq Visa Debit Platinum Card"]	image	t	{photos/photo_284@06-09-2025_18-53-55.jpg}	2026-02-27 17:48:58.342	2026-02-28 08:52:00.022	message538	default_farnoosh_mashreq	\N
message540	2025-09-06 00:00:00	18:54	34.50	AED	expense	cmm56s17900038ogeyynewip3	Careem (Hala Taxi)	تاکسی از بلهاسا به خونه - جلسه اضافه دوم سینا	["Hala Taxi ride, 12 km, Belhasa Driving Center to Sobha Creek Vistas Reserve"] | ["Bank confirmation of Dubai Taxi Corporation charge via Mashreq Visa Debit Platinum Card"]	image	t	{photos/photo_285@06-09-2025_18-54-31.jpg,photos/photo_286@06-09-2025_18-54-32.jpg}	2026-02-27 17:48:58.342	2026-02-28 08:53:05.123	\N	default_farnoosh_mashreq	\N
message546	2025-09-08 00:00:00	12:19	10000.00	AED	income	cmm56s17000008ogezghgfclk	Mashreq ATM	واریز به حساب از طریق دستگاه ATM	["Cash deposit at Mashreq ATM, 20 x AED 500 notes, to account 019101544538"]	image	t	{photos/photo_290@08-09-2025_12-19-00.jpg}	2026-02-27 17:48:58.342	2026-02-27 17:48:58.342	\N	default_farnoosh_mashreq	\N
message548	2025-09-11 00:00:00	11:59	86.46	AED	expense	cmm56s17900038ogeyynewip3	Careem	پیک از خونه به مرکز النهده برای رسوندن امارات آی‌دی فرنوش به جناحی۶۱ درهم شد	["Careem delivery/pickup from Sobha Creek Vistas Reserve to Al Nahda Centre (Emirates ID pickup for Farnoosh from Janahi)"]	image	t	{photos/photo_291@11-09-2025_11-59-21.jpg}	2026-02-27 17:48:58.342	2026-02-27 17:48:58.342	\N	default_farnoosh_mashreq	\N
message549	2025-09-11 00:00:00	12:00	2.40	AED	expense	cmm56s17900038ogeyynewip3	\N	۲.۴۰ درهم به کریم بدهکار بودم پرداخت کردم8th September 04:42 PM	\N	text	f	{}	2026-02-27 17:48:58.342	2026-02-27 17:48:58.342	\N	default_farnoosh_mashreq	\N
message550	2025-09-11 00:00:00	12:17	44.18	AED	expense	cmm56s17900038ogeyynewip3	Careem	پیک از مرکز النهده به خونه برای پس گرفتن امارات آی‌دی فرنوش از جناحی	["Careem delivery/pickup from Yousef Janahi Holding to Sobha Creek Vistas Reserve (Emirates ID return)"]	image	t	{photos/photo_292@11-09-2025_12-17-21.jpg}	2026-02-27 17:48:58.342	2026-02-27 17:48:58.342	\N	default_farnoosh_mashreq	\N
message551	2025-09-11 00:00:00	12:18	28.00	AED	expense	cmm56s17900038ogeyynewip3	Careem (Hala Taxi)	تاکسی از خونه به بلهاسا - آخرین امتحان فرنوش RTA Road Test۲۹.۶۷ درهم شد	["Hala Taxi ride, 9 km, Sobha Creek Vistas Reserve to Belhasa Driving Center (RTA Road Test for Farnoosh)"]	image	t	{photos/photo_293@11-09-2025_12-18-36.jpg}	2026-02-27 17:48:58.342	2026-02-27 17:48:58.342	\N	default_farnoosh_mashreq	\N
message553	2025-09-11 00:00:00	12:21	32.50	AED	expense	cmm56s17900038ogeyynewip3	Careem (Hala Taxi)	تاکسی از بلهاسا به خونه - آخرین امتحان فرنوشRTA Road Test۳۴ درهم کم شده	["Hala Taxi ride, 11 km, Belhasa Driving Center to Sobha Creek Vistas Reserve (RTA Road Test for Farnoosh)"]	image	t	{photos/photo_294@11-09-2025_12-21-20.jpg}	2026-02-27 17:48:58.342	2026-02-27 17:48:58.342	\N	default_farnoosh_mashreq	\N
message554	2025-09-11 00:00:00	12:22	34.50	AED	expense	cmm56s17800028ogefz2eqqt0	\N	۳۴.۵۰ درهم از سوپر مارکت پایین خونه تخم مرغ خریدیم10th September12:46 PM	\N	text	f	{}	2026-02-27 17:48:58.342	2026-02-27 17:48:58.342	\N	default_farnoosh_mashreq	\N
message555	2025-09-11 00:00:00	12:24	37.17	AED	expense	cmm56s17900038ogeyynewip3	Careem (Comfort ride)	تاکسی از خونه به بلهاسا - آخرین امتحان سینا RTA Road Test	["Comfort ride, 9 km, Sobha Creek Vistas Reserve to Belhasa Driving Center (RTA Road Test for Sina)"]	image	t	{photos/photo_295@11-09-2025_12-24-34.jpg}	2026-02-27 17:48:58.342	2026-02-27 17:48:58.342	\N	default_farnoosh_mashreq	\N
message557	2025-09-11 00:00:00	12:26	36.50	AED	expense	cmm56s17900038ogeyynewip3	Careem (Hala Taxi)	تاکسی از بلهاسا به خونه - آخرین امتحان سیناRTA Road Testکلا ۳۶.۵۰ درهم شد	["Hala Taxi ride, 10 km, Belhasa Driving Center to Sobha Creek Vistas Reserve (RTA Road Test for Sina)"]	image	t	{photos/photo_296@11-09-2025_12-26-40.jpg}	2026-02-27 17:48:58.342	2026-02-27 17:48:58.342	\N	default_farnoosh_mashreq	\N
message558	2025-09-11 00:00:00	12:29	145.80	AED	expense	cmm56s17600018ogeqghk7vfb	The Food Bazaar (via Talabat)	سفارش غذا از فود بازارFood Bazaar	["1x Halim (AED 40.00)","1x Chicken & Mushroom Pizza 2-person (AED 55.00)","1x Bandari Sandwich (AED 28.00)","Service Fee (AED 3.90)","Delivery Fee (AED 8.90)"]	image	t	{photos/photo_297@11-09-2025_12-29-10.jpg}	2026-02-27 17:48:58.342	2026-02-27 17:48:58.342	\N	default_farnoosh_mashreq	\N
message541	2025-09-06 00:00:00	18:54	34.50	AED	expense	cmm56s17900038ogeyynewip3	Dubai Taxi Corporation	تاکسی از بلهاسا به خونه - جلسه اضافه دوم سینا	["Bank confirmation of Dubai Taxi Corporation charge via Mashreq Visa Debit Platinum Card"]	image	t	{photos/photo_286@06-09-2025_18-54-32.jpg}	2026-02-27 17:48:58.342	2026-02-28 08:53:05.123	message540	default_farnoosh_mashreq	\N
message542	2025-09-06 00:00:00	19:05	903.44	AED	expense	cmm56s17m000c8ogerjdoev6e	Tabby	پرداخت قسط اول Tabby بابت کلاس رانندگی فرنوش	["Tabby installment payment (1st of 4) for Belhasa Driving Center, total 3613.75 AED"]	image	t	{photos/photo_287@06-09-2025_19-05-35.jpg}	2026-02-27 17:48:58.342	2026-02-28 08:54:31.455	message543	default_farnoosh_mashreq	\N
message545	2025-09-07 00:00:00	17:18	6500.00	AED	expense	cmm5ckzhy0000pw01vktsd04i	Wadi Alkanz Project Management Services Co	پرداخت اولیه برای تمدید شرکت به جناحی	["Fund transfer to Wadi Alkanz for company renewal (professional and management consulting services) via Mashreq NEO"]	file	t	{files/MLC0709251415757.PDF}	2026-02-27 17:48:58.342	2026-02-28 08:54:50.227	\N	default_farnoosh_mashreq	\N
message552	2025-09-11 00:00:00	12:19	320.00	AED	expense	cmm56s17m000c8ogerjdoev6e	\N	۳۲۰ درهم تو مرکز بلهاسا بابت صدور گواهینامه فرنوش پول دادم10th September12:14 PM	\N	text	f	{}	2026-02-27 17:48:58.342	2026-02-28 08:55:24.111	\N	default_farnoosh_mashreq	\N
message556	2025-09-11 00:00:00	12:25	320.00	AED	expense	cmm56s17m000c8ogerjdoev6e	\N	۳۲۰ درهم تو مرکز بلهاسا بابت صدور گواهینامه سینا پول دادم10th September05:05 PM	\N	text	f	{}	2026-02-27 17:48:58.342	2026-02-28 08:55:48.871	\N	default_farnoosh_mashreq	\N
message560	2025-09-15 00:00:00	10:58	10.00	AED	expense	cmm56s17600018ogeqghk7vfb	\N	سینا تو جشن ایرانیان ۱۰ درهم پاپ کرن خریده13th September08:12 PM	\N	text	f	{}	2026-02-27 17:48:58.342	2026-02-28 08:56:51.025	\N	default_farnoosh_mashreq	\N
message561	2025-09-15 00:00:00	11:50	205.00	AED	expense	cmm56s17800028ogefz2eqqt0	Seyed Kazem Mirjalili General Trading LLC	خرید میوه از سید کاظم میرجلیلی	["Fig Irani Black","Wheat Feta Cheese 300g","Extra Heavy Duty AAA 1.5V batteries","Kalleh Assel Gogh 1.5L","Potato Irani KG","Nectarine Irani PAK","Pear Irani PAK","Onion White KG","Mandarin Shomal (Tray)","Carrot Irani KG","Mushroom PAK","Celery","Tomato Irani KG","Zalzalak","Kiwi Green PAK","Cornelian Cherry PAK","Tabiat Tuna Fish in Brine","Golestan Lentil 450g","Lettuce Romaine KG"]	image	t	{photos/photo_298@15-09-2025_11-50-32.jpg}	2026-02-27 17:48:58.342	2026-02-27 17:48:58.342	\N	default_farnoosh_mashreq	\N
message590	2025-09-23 00:00:00	00:57	76.88	AED	expense	cmm5cqzf10001pw01d9pekwf0	Carrefour	خرید باتری برای مامان	\N	image	t	{photos/photo_317@23-09-2025_00-57-18.jpg}	2026-02-27 17:48:58.342	2026-02-28 09:00:49.17	\N	default_farnoosh_mashreq	\N
message564	2025-09-15 00:00:00	20:25	36.37	AED	expense	cmm56s17800028ogefz2eqqt0	Geant Express (GMG Consumer LLC)	Geant	["Bread (AED 11.85)","Banana Chiquita (AED 10.05)","Avocado Ready to Eat (AED 12.94)"]	image	t	{photos/photo_299@15-09-2025_20-25-32.jpg}	2026-02-27 17:48:58.342	2026-02-27 17:48:58.342	\N	default_farnoosh_mashreq	\N
message566	2025-09-15 00:00:00	20:26	171.13	AED	expense	cmm56s17800028ogefz2eqqt0	Geant Express	Geant	\N	image	t	{photos/photo_300@15-09-2025_20-26-22.jpg}	2026-02-27 17:48:58.342	2026-02-27 17:48:58.342	\N	default_farnoosh_mashreq	\N
message570	2025-09-20 00:00:00	17:19	229.00	AED	expense	cmm56s17600018ogeqghk7vfb	Rivas	ریواس	\N	image	t	{photos/photo_301@20-09-2025_17-19-08.jpg}	2026-02-27 17:48:58.342	2026-02-27 17:48:58.342	\N	default_farnoosh_mashreq	\N
message571	2025-09-20 00:00:00	17:19	2.00	AED	expense	cmm56s17800028ogefz2eqqt0	Urban Fresh Mini Mart Co. LLC	خرید نون از سوپرمارکت پایین خونه	\N	image	t	{photos/photo_302@20-09-2025_17-19-42.jpg}	2026-02-27 17:48:58.342	2026-02-27 17:48:58.342	\N	default_farnoosh_mashreq	\N
message574	2025-09-20 00:00:00	17:22	252.68	AED	expense	cmm56s17g00088oge05l6cktv	Tamara (Nike Jordan)	قسط اول تامارا برای خرید کتونی جفتمون از نایکNike Jordanکتونی نایک هرکدوممون ۳۷۹ درهم - جمعا ۷۵۸ درهم	\N	image	t	{photos/photo_305@20-09-2025_17-22-02.jpg}	2026-02-27 17:48:58.342	2026-02-27 17:48:58.342	\N	default_farnoosh_mashreq	\N
message575	2025-09-20 00:00:00	17:23	179.34	AED	expense	cmm56s17g00088oge05l6cktv	Tamara (Skechers)	قسط اول تامارا برای خرید کتونی جفتمون از اسکیچرزSkechersکتونی اسکیچرز هرکدوممون ۲۶۹ درهم - جمعا ۵۳۸ درهم	\N	image	t	{photos/photo_306@20-09-2025_17-23-39.jpg}	2026-02-27 17:48:58.342	2026-02-27 17:48:58.342	\N	default_farnoosh_mashreq	\N
message576	2025-09-20 00:00:00	17:25	34.99	AED	expense	cmm56s17600018ogeqghk7vfb	Carrefour Al Ghurair	ناهار در کارفور	\N	image	t	{photos/photo_307@20-09-2025_17-25-46.jpg}	2026-02-27 17:48:58.342	2026-02-27 17:48:58.342	\N	default_farnoosh_mashreq	\N
message577	2025-09-20 00:00:00	17:28	157.78	AED	expense	cmm56s17800028ogefz2eqqt0	Carrefour Al Ghurair	خرید خونه و سوغاتی کارفورخرید خونه ۹۳ درهمسوغاتی ۶۸ درهم	\N	image	t	{photos/photo_308@20-09-2025_17-28-48.jpg}	2026-02-27 17:48:58.342	2026-02-27 17:48:58.342	\N	default_farnoosh_mashreq	\N
message579	2025-09-20 00:00:00	17:29	69.87	AED	expense	cmm56s17j000a8ogezifv1oi1	Supercare Pharmacy	وارفارین مامان	\N	image	t	{photos/photo_309@20-09-2025_17-29-42.jpg}	2026-02-27 17:48:58.342	2026-02-27 17:48:58.342	\N	default_farnoosh_mashreq	\N
message580	2025-09-20 00:00:00	17:31	168.25	AED	expense	cmm56s17g00088oge05l6cktv	LRIL (Al Ghurair Centre)	خرید لباسای سینا - دوتا تیشرت ۶۹ درهم و پیرهن مشکی ۹۹ درهم	\N	image	t	{photos/photo_310@20-09-2025_17-31-18.jpg}	2026-02-27 17:48:58.342	2026-02-27 17:48:58.342	\N	default_farnoosh_mashreq	\N
message581	2025-09-20 00:00:00	17:32	59.00	AED	expense	cmm56s17g00088oge05l6cktv	LC Waikiki	تیشرت سینا از LC Waikiki	\N	image	t	{photos/photo_311@20-09-2025_17-32-01.jpg}	2026-02-27 17:48:58.342	2026-02-27 17:48:58.342	\N	default_farnoosh_mashreq	\N
message583	2025-09-20 00:00:00	17:33	70.00	AED	expense	cmm56s17600018ogeqghk7vfb	H N S Restaurant	بستنی و آبمیوه ژلاتو	\N	image	t	{photos/photo_312@20-09-2025_17-33-33.jpg}	2026-02-27 17:48:58.342	2026-02-27 17:48:58.342	\N	default_farnoosh_mashreq	\N
message584	2025-09-20 00:00:00	17:33	76.34	AED	expense	cmm56s17g00088oge05l6cktv	Tamara (Skechers)	قسط اول تامارا برای خرید کتونی بابای سینا از اسکیچرزSkechersجمعا ۲۲۹ درهم	\N	image	t	{photos/photo_313@20-09-2025_17-33-53.jpg}	2026-02-27 17:48:58.342	2026-02-27 17:48:58.342	\N	default_farnoosh_mashreq	\N
message586	2025-09-20 00:00:00	17:40	67.28	AED	expense	cmm56s17800028ogefz2eqqt0	Carrefour Al Ghurair	خرید شامپو مامان از کارفور	\N	image	t	{photos/photo_315@20-09-2025_17-40-44.jpg}	2026-02-27 17:48:58.342	2026-02-27 17:48:58.342	\N	default_farnoosh_mashreq	\N
message587	2025-09-20 00:00:00	17:41	58.50	AED	expense	cmm56s17900038ogeyynewip3	Dubai Taxi Corporation	تاکسی از الغریر به خونه	\N	image	t	{photos/photo_316@20-09-2025_17-41-51.jpg}	2026-02-27 17:48:58.342	2026-02-27 17:48:58.342	\N	default_farnoosh_mashreq	\N
message591	2025-09-23 00:00:00	00:57	2.00	AED	expense	cmm56s17800028ogefz2eqqt0	Urban Fresh Mini Mart Co. LLC	خرید نان از سوپرمارکت پایین خونه	\N	image	t	{photos/photo_318@23-09-2025_00-57-41.jpg}	2026-02-27 17:48:58.342	2026-02-27 17:48:58.342	\N	default_farnoosh_mashreq	\N
message592	2025-09-23 00:00:00	00:59	69.83	AED	expense	cmm56s17j000a8ogezifv1oi1	Life Pharmacy	سرم ضد جوش و لک از داروخانه لایف	\N	image	t	{photos/photo_319@23-09-2025_00-59-58.jpg}	2026-02-27 17:48:58.342	2026-02-27 17:48:58.342	\N	default_farnoosh_mashreq	\N
message572	2025-09-20 00:00:00	17:19	50.50	AED	expense	cmm56s17900038ogeyynewip3	Hala Taxi (Careem)	تاکسی از خونه به مرکز خرید الغریر	\N	image	t	{photos/photo_303@20-09-2025_17-19-53.jpg,photos/photo_304@20-09-2025_17-19-53.jpg}	2026-02-27 17:48:58.342	2026-02-28 08:57:06.69	\N	default_farnoosh_mashreq	\N
message585	2025-09-20 00:00:00	17:39	59.00	AED	expense	cmm5cqzf10001pw01d9pekwf0	Adidas Factory Outlet	خرید خنک نگهدارنده از آدیداسCooler BagAdidas	\N	image	t	{photos/photo_314@20-09-2025_17-39-34.jpg}	2026-02-27 17:48:58.342	2026-02-28 08:57:59.826	\N	default_farnoosh_mashreq	\N
message589	2025-09-21 00:00:00	18:15	2.14	AED	expense	cmm56s17800028ogefz2eqqt0	\N	۲.۱۴ درهم از سوپر مارکت پایین خونه لیمو خریدیم21th September02:55 PM	\N	text	f	{}	2026-02-27 17:48:58.342	2026-02-28 09:00:40.337	\N	default_farnoosh_mashreq	\N
message594	2025-09-23 00:00:00	01:02	15000.00	AED	income	cmm56s17000008ogezghgfclk	Mashreq ATM - DXB Mall Branch	واریز به حساب از طریق دستگاه ATM	["Cash deposit: 10x AED 500 = AED 5000","Cash deposit: 10x AED 1000 = AED 10000"]	image	t	{photos/photo_320@23-09-2025_01-02-11.jpg}	2026-02-27 17:48:58.342	2026-02-27 17:48:58.342	\N	default_farnoosh_mashreq	\N
message597	2025-09-23 00:00:00	12:09	11.00	AED	expense	cmm56s17j000a8ogezifv1oi1	Urban Fresh Mini Mart Co. LLC	خرید نوار بهداشتی از سوپرمارکت پایین خونه	["Sanitary supplies"]	image	t	{photos/photo_321@23-09-2025_12-09-12.jpg}	2026-02-27 17:48:58.342	2026-02-28 09:01:19.594	\N	default_farnoosh_mashreq	\N
message603	2025-10-12 00:00:00	12:45	18750.00	AED	expense	cmm56s17e00068ogeybi889nb	\N	۱۸,۷۵۰ درهم سومین چک خونه پاس شده3rd October 09:15 AM	\N	text	f	{}	2026-02-27 17:48:58.342	2026-02-28 09:02:09.152	\N	default_farnoosh_mashreq	\N
message598	2025-09-23 00:00:00	12:09	50.00	AED	expense	cmm56s17900038ogeyynewip3	Cars Taxi	تاکسی از خونه به فرودگاه	["Taxi from home to airport"]	image	t	{photos/photo_322@23-09-2025_12-09-30.jpg}	2026-02-27 17:48:58.342	2026-02-27 17:48:58.342	\N	default_farnoosh_mashreq	\N
message599	2025-09-23 00:00:00	12:18	66.25	AED	expense	cmm56s17600018ogeqghk7vfb	Dubai Duty Free	خرید تو فرودگاه دبی	["Mars Chocolate Bar Loose 1x12x24x51g - AED 4.00","Pringles BBQ Chips 19x165g - AED 11.50","Milka Milk Alpine Tablet 17x250g - AED 50.75"]	image	t	{photos/photo_323@23-09-2025_12-18-05.jpg}	2026-02-27 17:48:58.342	2026-02-27 17:48:58.342	\N	default_farnoosh_mashreq	\N
message610	2025-10-12 00:00:00	13:02	903.44	AED	expense	cmm56s17m000c8ogerjdoev6e	Tabby	پرداخت قسط دوم Tabby بابت کلاس رانندگی فرنوش	["Tabby installment payment (2nd) for Belhasa Driving Center - driving lessons"] | Driving lessons via Tabby in 4 installments	image	t	{photos/photo_329@12-10-2025_13-02-45.jpg,photos/photo_330@12-10-2025_13-02-45.jpg}	2026-02-27 17:48:58.342	2026-02-28 09:14:01.576	\N	default_farnoosh_mashreq	\N
message604	2025-10-12 00:00:00	12:59	85.00	AED	expense	cmm56s17a00048ogeacrpia4x	du	شارژ du سیم کارت سینا	["du SIM card recharge"]	image	t	{photos/photo_324@12-10-2025_12-59-15.jpg}	2026-02-27 17:48:58.342	2026-02-27 17:48:58.342	\N	default_farnoosh_mashreq	\N
message605	2025-10-12 00:00:00	12:59	67.50	AED	expense	cmm56s17900038ogeyynewip3	Dubai Taxi Corporation	تاکسی از فرودگاه دبی به خونه	["Taxi from Dubai airport to home"]	image	t	{photos/photo_325@12-10-2025_12-59-43.jpg}	2026-02-27 17:48:58.342	2026-02-27 17:48:58.342	\N	default_farnoosh_mashreq	\N
message606	2025-10-12 00:00:00	13:00	43.00	AED	expense	cmm56s17800028ogefz2eqqt0	Urban Fresh Mini Mart Co. LLC	خرید نان و تخم مرغ از مغازه پایین خونه	["Bread and eggs"]	image	t	{photos/photo_326@12-10-2025_13-00-03.jpg}	2026-02-27 17:48:58.342	2026-02-27 17:48:58.342	\N	default_farnoosh_mashreq	\N
message607	2025-10-12 00:00:00	13:00	178.01	AED	expense	cmm56s17800028ogefz2eqqt0	Carrefour	کارفور	["Groceries from Carrefour"]	image	t	{photos/photo_327@12-10-2025_13-00-17.jpg}	2026-02-27 17:48:58.342	2026-02-27 17:48:58.342	\N	default_farnoosh_mashreq	\N
message608	2025-10-12 00:00:00	13:00	180.01	AED	expense	cmm56s17800028ogefz2eqqt0	Carrefour	\N	["White Mushrooms 250g - AED 6.69","Norwegian Salmon Fillet 0.5kg - AED 49.90","Al Khazna Chicken Fresh Skinless Chicken Breast x2 - AED 55.98","Persil Power Gel Liquid Laundry Detergent - AED 61.49","Service Fee - AED 3.95"]	image	t	{photos/photo_328@12-10-2025_13-00-17.jpg}	2026-02-27 17:48:58.342	2026-02-27 17:48:58.342	\N	default_farnoosh_mashreq	\N
message614	2025-10-17 00:00:00	14:44	49.00	AED	expense	cmm56s17900038ogeyynewip3	\N	۴۹ درهم تاکسی برگشت از جیتکس به خونه - سینا13th October 03:48 PM	\N	text	f	{}	2026-02-27 17:48:58.342	2026-02-28 10:26:00.18	\N	default_farnoosh_mashreq	\N
message612	2025-10-17 00:00:00	14:41	32.00	AED	expense	cmm56s17900038ogeyynewip3	Hala Taxi	تاکسی از خونه به جیتکس - سینا	["Taxi from home to GITEX (Dubai World Trade Centre), 10 km, 18 min, paid cash"]	image	t	{photos/photo_331@17-10-2025_14-41-36.jpg}	2026-02-27 17:48:58.342	2026-02-27 17:48:58.342	\N	default_farnoosh_mashreq	\N
message613	2025-10-17 00:00:00	14:43	20.00	AED	expense	cmm56s17800028ogefz2eqqt0	\N	۲۰ درهم سینا تو جیتکس آب خریده13th October 02:05 PM	\N	text	f	{}	2026-02-27 17:48:58.342	2026-02-27 17:48:58.342	\N	default_farnoosh_mashreq	\N
message615	2025-10-17 00:00:00	14:58	31.84	AED	expense	cmm56s17800028ogefz2eqqt0	Carrefour Market - Azizi Riviera	کارفور	["PPW Bag Dessert - AED 2.00","Lemon - AED 5.43","Tomato EP - AED 2.38","Cucumber KG EP - AED 2.03","Banana EP - AED 4.79","CRF RTE Avocado 350g - AED 12.99","Onion Red - AED 0.95","Potato EP - AED 1.27"]	image	t	{photos/photo_332@17-10-2025_14-58-04.jpg}	2026-02-27 17:48:58.342	2026-02-27 17:48:58.342	\N	default_farnoosh_mashreq	\N
message616	2025-10-17 00:00:00	14:59	7.00	AED	expense	cmm56s17800028ogefz2eqqt0	\N	۷ درهم تو جیتکس آب خریدم14th October 01:38 PM	\N	text	f	{}	2026-02-27 17:48:58.342	2026-02-27 17:48:58.342	\N	default_farnoosh_mashreq	\N
message617	2025-10-17 00:00:00	14:59	235.00	AED	expense	cmm56s17600018ogeqghk7vfb	The SIB Restaurant LLC	رستوران سیب	["Complimentary Vegetable & Bread - AED 0.00","Special Doogh x2 - AED 60.00","Salad Shirazi - AED 27.00","Chenjeh - AED 79.00","Jooje Kabab Masti - AED 69.00"]	image	t	{photos/photo_333@17-10-2025_14-59-43.jpg}	2026-02-27 17:48:58.342	2026-02-27 17:48:58.342	\N	default_farnoosh_mashreq	\N
message618	2025-10-17 00:00:00	15:00	53.42	AED	expense	cmm56s17800028ogefz2eqqt0	Geant Express - One Park Avenue	Geant	["Carrot Australia - AED 3.10","Romaine Lettuce - AED 4.95","Loaf Rye Bread - AED 9.00","Peach Yellow - AED 20.52","Farm Fresh Eggs - AED 15.85"]	image	t	{photos/photo_334@17-10-2025_15-00-02.jpg}	2026-02-27 17:48:58.342	2026-02-27 17:48:58.342	\N	default_farnoosh_mashreq	\N
message620	2025-10-17 00:00:00	15:03	12.00	AED	expense	cmm56s17900038ogeyynewip3	RTA Dubai	۱۲ درهم جلوی panhome پول پارکینگ دادیم	["Parking fee in front of Pan Home"]	image	t	{photos/photo_335@17-10-2025_15-03-42.jpg}	2026-02-27 17:48:58.342	2026-02-27 17:48:58.342	\N	default_farnoosh_mashreq	\N
message621	2025-10-17 00:00:00	15:04	24.00	AED	expense	cmm56s17800028ogefz2eqqt0	Royal Corn Foodstuff T	توی oasis mall ذرت مکزیکی خریدیم	["grocery items from Oasis Mall"]	image	t	{photos/photo_336@17-10-2025_15-04-19.jpg}	2026-02-27 17:48:58.342	2026-02-27 17:48:58.342	\N	default_farnoosh_mashreq	\N
message609	2025-10-12 00:00:00	13:00	1225.00	AED	expense	cmm56s17a00048ogeacrpia4x	Mashreq NEO	پرداخت پول اینترنت ۳ ماه دوم به بشارJulyAugustSeptember	["Fund transfer to Bashar Georgi Alarbaji Alsayegh - Utility Bill Payments (Internet 3 months: July, August, September)"]	file	t	{files/MLC1210251149208.PDF}	2026-02-27 17:48:58.342	2026-02-27 21:01:07.739	\N	default_farnoosh_mashreq	\N
message595	2025-09-23 00:00:00	12:08	5000.00	AED	income	cmm56s17i00098oge2xb5or4t	Mashreq NEO	کارت به کارت سینا به فرنوش	["Fund transfer to Farnoosh Bagheri - Family Support"]	file	t	{files/MWM2309250954347.PDF}	2026-02-27 17:48:58.342	2026-02-28 07:16:16.495	\N	default_farnoosh_mashreq	\N
message596	2025-09-23 00:00:00	12:08	\N	AED	income	cmm56s17i00098oge2xb5or4t	Mashreq Neo	کارت به کارت سینا به فرنوش	\N	text	f	{}	2026-02-27 17:48:58.342	2026-02-28 07:16:16.495	message595	default_farnoosh_mashreq	\N
message628	2025-10-17 00:00:00	15:11	82.00	AED	expense	cmm56s17600018ogeqghk7vfb	Subway	غذا در subway	["Subway meal"]	image	t	{photos/photo_341@17-10-2025_15-11-03.jpg}	2026-02-27 17:48:58.342	2026-02-27 17:48:58.342	\N	default_farnoosh_mashreq	\N
message629	2025-10-17 00:00:00	15:11	26.00	AED	expense	cmm56s17600018ogeqghk7vfb	Cinnabon	کاپوچینو و شیرینی - کافی شاپ	["Cappuccino Reg","Cookies Oat Raisin"]	image	t	{photos/photo_342@17-10-2025_15-11-54.jpg}	2026-02-27 17:48:58.342	2026-02-27 17:48:58.342	\N	default_farnoosh_mashreq	\N
message631	2025-10-17 00:00:00	15:12	248.72	AED	expense	cmm56s17800028ogefz2eqqt0	Carrefour	کارفور	["PPW Bag Dessert","Onion Red","Potato","Apple Green","Passion Fruit","Tomato Round Selec","Capsicum Green","Pomegranate","Seabream 400/600G","Lime Green","Baby Cucumber","Kiwi","Lettuce Romaine","Strawberry","Nectarine","Chicken Fillet 500G","Chicken Fillet 500G","AUS BF Mince Low Fat","Dove 1on1 Hair Serum"]	image	t	{photos/photo_344@17-10-2025_15-12-31.jpg}	2026-02-27 17:48:58.342	2026-02-27 17:48:58.342	\N	default_farnoosh_mashreq	\N
message634	2025-10-17 00:00:00	15:14	179.33	AED	expense	cmm56s17g00088oge05l6cktv	Apparel Group Stores UAE	\N	["Tamara installment 2/3 - Skechers shoes (2 pairs, total 538 AED)"]	image	t	{photos/photo_346@17-10-2025_15-14-10.jpg}	2026-02-27 17:48:58.342	2026-02-27 17:48:58.342	\N	default_farnoosh_mashreq	\N
message635	2025-10-17 00:00:00	15:14	179.33	AED	expense	cmm56s17g00088oge05l6cktv	Skechers	قسط دوم تامارا برای خرید کتونی جفتمون از اسکیچرزSkechersکتونی اسکیچرز هرکدوممون ۲۶۹ درهم - جمعا ۵۳۸ درهم	["Tamara installment 2/3 - Skechers shoes (2 pairs at 269 AED each, total 538 AED)"]	image	t	{photos/photo_347@17-10-2025_15-14-10.jpg}	2026-02-27 17:48:58.342	2026-02-27 17:48:58.342	\N	default_farnoosh_mashreq	\N
message636	2025-10-17 00:00:00	15:27	252.66	AED	expense	cmm56s17g00088oge05l6cktv	Sun & Sand Sports Stores UAE	قسط دوم تامارا برای خرید کتونی جفتمون از نایکNike Jordanکتونی نایک هرکدوممون ۳۷۹ درهم - جمعا ۷۵۸ درهم	["Tamara installment 2/3 - Nike Jordan shoes (2 pairs at 379 AED each, total 758 AED)"]	image	t	{photos/photo_348@17-10-2025_15-27-22.jpg}	2026-02-27 17:48:58.342	2026-02-27 17:48:58.342	\N	default_farnoosh_mashreq	\N
message637	2025-10-17 00:00:00	15:28	76.33	AED	expense	cmm56s17g00088oge05l6cktv	Skechers	قسط دوم تامارا برای خرید کتونی بابای سینا از اسکیچرزSkechersجمعا ۲۲۹ درهم	["Tamara installment 2/3 - Skechers shoes for father (total 229 AED)"]	image	t	{photos/photo_349@17-10-2025_15-28-01.jpg}	2026-02-27 17:48:58.342	2026-02-27 17:48:58.342	\N	default_farnoosh_mashreq	\N
message638	2025-10-19 00:00:00	11:26	30.00	AED	expense	cmm56s17900038ogeyynewip3	Bay Avenue Parking	پول پارکینگ تو Bay Avenue با یاسمن	["parking ticket (2h 18min)"]	image	t	{photos/photo_350@19-10-2025_11-26-02.jpg}	2026-02-27 17:48:58.342	2026-02-27 17:48:58.342	\N	default_farnoosh_mashreq	\N
message640	2025-10-19 00:00:00	11:27	20.00	AED	expense	cmm56s17900038ogeyynewip3	Blue Waters Island Parking	۲۰ درهم پول پارکینگ تو بلو واترز دادیم18th October10:32 PM	["parking at Blue Waters"]	image	t	{photos/photo_351@19-10-2025_11-27-43.jpg}	2026-02-27 17:48:58.342	2026-02-27 17:48:58.342	\N	default_farnoosh_mashreq	\N
message624	2025-10-17 00:00:00	15:08	19.00	AED	expense	cmm5cqzf10001pw01d9pekwf0	Home Box	خرید چوب لباسی پشت در از Home Box	["Dragon Over The Door Ten Hooks Rack"]	image	t	{photos/photo_339@17-10-2025_15-08-28.jpg}	2026-02-27 17:48:58.342	2026-02-28 09:07:34.6	\N	default_farnoosh_mashreq	\N
message642	2025-10-27 00:00:00	11:16	4.00	AED	expense	cmm56s17900038ogeyynewip3	Parking (Toyota Showroom Sheikh Zayed)	پول پارکینگ جلوی نمایندگی تویوتا شیخ زاید	["parking ticket (1 hour)"]	image	t	{photos/photo_352@27-10-2025_11-16-11.jpg}	2026-02-27 17:48:58.342	2026-02-27 17:48:58.342	\N	default_farnoosh_mashreq	\N
message643	2025-10-27 00:00:00	11:17	4.00	AED	expense	cmm56s17900038ogeyynewip3	Parking (Kia Showroom Sheikh Zayed)	پول پارکینگ جلوی نمایندگی کیا شیخ زاید	["parking ticket (1 hour)"]	image	t	{photos/photo_353@27-10-2025_11-17-20.jpg}	2026-02-27 17:48:58.342	2026-02-27 17:48:58.342	\N	default_farnoosh_mashreq	\N
message644	2025-10-27 00:00:00	11:18	6.00	AED	expense	cmm56s17900038ogeyynewip3	Parking (Hyundai Showroom Sheikh Zayed)	پول پارکینگ جلوی نمایندگی هیوندا شیخ زاید	["parking ticket (1 hour)"]	image	t	{photos/photo_354@27-10-2025_11-18-01.jpg}	2026-02-27 17:48:58.342	2026-02-27 17:48:58.342	\N	default_farnoosh_mashreq	\N
message645	2025-10-27 00:00:00	11:19	76.00	AED	expense	cmm56s17900038ogeyynewip3	\N	۷۶ درهم پول بنزین دادیم24th October12:48 PM	\N	text	f	{}	2026-02-27 17:48:58.342	2026-02-27 17:48:58.342	\N	default_farnoosh_mashreq	\N
message646	2025-10-27 00:00:00	11:20	117.00	AED	expense	cmm56s17600018ogeqghk7vfb	Rivas	ریواس	["Tahchin (Chicken)","Doogh","Salad Shirazi"]	image	t	{photos/photo_355@27-10-2025_11-20-29.jpg}	2026-02-27 17:48:58.411	2026-02-27 17:48:58.411	\N	default_farnoosh_mashreq	\N
message647	2025-10-27 00:00:00	11:21	3.00	AED	expense	cmm56s17900038ogeyynewip3	Parking (Galadari)	پول پارکینگ جلوی نمایندگی Galadari	["parking ticket (30 min)"]	image	t	{photos/photo_356@27-10-2025_11-21-06.jpg}	2026-02-27 17:48:58.411	2026-02-27 17:48:58.411	\N	default_farnoosh_mashreq	\N
message652	2025-10-27 00:00:00	11:33	82.00	AED	expense	cmm56s17600018ogeqghk7vfb	Subway	Subway	["Subway meal"]	image	t	{photos/photo_358@27-10-2025_11-33-04.jpg}	2026-02-27 17:48:58.411	2026-02-27 17:48:58.411	\N	default_farnoosh_mashreq	\N
message653	2025-10-27 00:00:00	11:34	6.00	AED	expense	cmm56s17900038ogeyynewip3	Parking (Mashreq Metro)	پول پارکینگ جلوی متروی مشرق	["parking ticket (1 hour)"]	image	t	{photos/photo_359@27-10-2025_11-34-31.jpg}	2026-02-27 17:48:58.411	2026-02-27 17:48:58.411	\N	default_farnoosh_mashreq	\N
message654	2025-10-27 00:00:00	11:35	10000.00	AED	income	cmm56s17000008ogezghgfclk	Mashreq Bank ATM	واریز به حساب از طریق دستگاه ATM	["Cash deposit via ATM (500 x 20)"]	image	t	{photos/photo_360@27-10-2025_11-35-39.jpg}	2026-02-27 17:48:58.411	2026-02-27 17:48:58.411	\N	default_farnoosh_mashreq	\N
message626	2025-10-17 00:00:00	15:09	36.00	AED	expense	cmm5cqzf10001pw01d9pekwf0	Home Centre	خرید سینی از Home Center	["Sable Round Wooden Serving Tray"]	image	t	{photos/photo_340@17-10-2025_15-09-47.jpg}	2026-02-27 17:48:58.342	2026-02-28 09:07:42.347	\N	default_farnoosh_mashreq	\N
message630	2025-10-17 00:00:00	15:12	50.10	AED	expense	cmm5cqzf10001pw01d9pekwf0	IKEA	ایکیا	["IKEA purchase"]	image	t	{photos/photo_343@17-10-2025_15-12-21.jpg}	2026-02-27 17:48:58.342	2026-02-28 09:07:51.219	\N	default_farnoosh_mashreq	\N
message633	2025-10-17 00:00:00	15:13	38.00	AED	expense	cmm56s17600018ogeqghk7vfb	Spinneys Sobha Hartland	از اسپینس شام خریدیمSpinneys	["dinner groceries"]	image	t	{photos/photo_345@17-10-2025_15-13-46.jpg}	2026-02-27 17:48:58.342	2026-02-28 09:07:59.005	\N	default_farnoosh_mashreq	\N
message650	2025-10-27 00:00:00	11:32	125.00	AED	expense	cmm5cqzf10001pw01d9pekwf0	Pan Home (Pan Emirates)	خرید از panhome	["Earlo Glass Canister With Spoon 1.2L x5","Earlo Glass Canister With Spoon 800ml x2","Livvy Soap Dispenser Black 350ml"]	image	t	{photos/photo_357@27-10-2025_11-32-21.jpg}	2026-02-27 17:48:58.411	2026-02-28 09:09:04.818	\N	default_farnoosh_mashreq	\N
message684	2025-11-09 00:00:00	12:12	76.97	AED	expense	cmm5cqzf10001pw01d9pekwf0	Carrefour	خرید لوازم خونه از کارفور	["L&L Glass Rect 2L 33.49","L&L Glass Rect 2L 33.49","Feelings Metal Hanger 12pk 9.99"]	image	t	{photos/photo_382@09-11-2025_12-12-20.jpg}	2026-02-27 17:48:58.411	2026-02-28 09:10:37.066	\N	default_farnoosh_mashreq	\N
message655	2025-10-27 00:00:00	11:39	219.01	AED	expense	cmm56s17800028ogefz2eqqt0	Geant Express - One Park Avenue	Geant	["Facial tissues","Pril dishwashing","Nezo iodized tab","Bread kraftkorn","Avocado ready to","House of Pops chocolate","Salmon fillet no (x2)","Organic salmon fillet","Cornetto ice cream","London Diary chocolate","Banana Chiquita"]	image	t	{photos/photo_361@27-10-2025_11-39-02.jpg}	2026-02-27 17:48:58.411	2026-02-27 17:48:58.411	\N	default_farnoosh_mashreq	\N
message676	2025-11-09 00:00:00	12:04	100.00	AED	expense	cmm60aoac0000ry015m0ptwvq	Al Ain Food And Beverage	شارژ حساب العین	["Al Ain account top-up"]	image	t	{photos/photo_375@09-11-2025_12-04-45.jpg}	2026-02-27 17:48:58.411	2026-02-28 09:10:13.282	\N	default_farnoosh_mashreq	\N
message659	2025-10-29 00:00:00	18:45	4.00	AED	expense	cmm56s17900038ogeyynewip3	Parkin	پول پارکینگ جلوی نمایندگی مزدا شیخ زاید	["Parking near Mazda dealership Sheikh Zayed"]	image	t	{photos/photo_362@29-10-2025_18-45-27.jpg}	2026-02-27 17:48:58.411	2026-02-27 17:48:58.411	\N	default_farnoosh_mashreq	\N
message660	2025-10-29 00:00:00	18:46	4.00	AED	expense	cmm56s17900038ogeyynewip3	Parkin	پول پارکینگ جلوی نمایندگی تویوتا شیخ زاید	["Parking near Toyota dealership Sheikh Zayed"]	image	t	{photos/photo_363@29-10-2025_18-46-00.jpg}	2026-02-27 17:48:58.411	2026-02-27 17:48:58.411	\N	default_farnoosh_mashreq	\N
message661	2025-10-29 00:00:00	18:47	10.00	AED	expense	cmm56s17a00048ogeacrpia4x	du	اینترنت du خط سینا	["Internet top-up du (Sina's line)"]	image	t	{photos/photo_364@29-10-2025_18-47-06.jpg}	2026-02-27 17:48:58.411	2026-02-27 17:48:58.411	\N	default_farnoosh_mashreq	\N
message662	2025-10-29 00:00:00	18:47	79.00	AED	expense	cmm56s17600018ogeqghk7vfb	Subway	شام subway	["Dinner at Subway"]	image	t	{photos/photo_365@29-10-2025_18-47-43.jpg}	2026-02-27 17:48:58.411	2026-02-27 17:48:58.411	\N	default_farnoosh_mashreq	\N
message663	2025-10-29 00:00:00	18:48	36.00	AED	expense	cmm56s17600018ogeqghk7vfb	Subway	شام subway	["Dinner at Subway"]	image	t	{photos/photo_366@29-10-2025_18-48-05.jpg}	2026-02-27 17:48:58.411	2026-02-27 17:48:58.411	\N	default_farnoosh_mashreq	\N
message664	2025-10-29 00:00:00	18:48	513.00	AED	expense	cmm56s17a00048ogeacrpia4x	du	\N	["du annual internet (Farnoosh's line)"]	image	t	{photos/photo_367@29-10-2025_18-48-48.jpg}	2026-02-27 17:48:58.411	2026-02-27 17:48:58.411	\N	default_farnoosh_mashreq	\N
message665	2025-10-29 00:00:00	18:48	25.00	AED	expense	cmm56s17a00048ogeacrpia4x	du	اینترنت سالانه du خط فرنوش	["du annual internet (Farnoosh's line)"]	image	t	{photos/photo_368@29-10-2025_18-48-48.jpg}	2026-02-27 17:48:58.411	2026-02-27 17:48:58.411	\N	default_farnoosh_mashreq	\N
message666	2025-10-29 00:00:00	18:50	2.00	AED	expense	cmm56s17900038ogeyynewip3	Parkin	پول پارکینگ جلوی Galadari دیره	["Parking near Galadari (Deira)"]	image	t	{photos/photo_369@29-10-2025_18-50-03.jpg}	2026-02-27 17:48:58.411	2026-02-27 17:48:58.411	\N	default_farnoosh_mashreq	\N
message667	2025-10-29 00:00:00	18:50	6.00	AED	expense	cmm56s17900038ogeyynewip3	Parkin	پول پارکینگ - رفته بودیم از دوستای مهدی (تبدیل) پول بگیریم	["Parking - went to collect money from Mehdi's friends (Tabdil)"]	image	t	{photos/photo_370@29-10-2025_18-50-58.jpg}	2026-02-27 17:48:58.411	2026-02-27 17:48:58.411	\N	default_farnoosh_mashreq	\N
message668	2025-11-09 00:00:00	11:49	122.00	AED	expense	cmm56s17600018ogeqghk7vfb	Iran Zamin	غذا در ایران زمین	["Food at Iran Zamin restaurant"]	image	t	{photos/photo_371@09-11-2025_11-49-34.jpg}	2026-02-27 17:48:58.411	2026-02-27 17:48:58.411	\N	default_farnoosh_mashreq	\N
message669	2025-11-09 00:00:00	11:50	50.00	AED	expense	cmm56s17a00048ogeacrpia4x	du	شارژ حساب du خودم	["du account top-up (own line)"]	image	t	{photos/photo_372@09-11-2025_11-50-01.jpg}	2026-02-27 17:48:58.411	2026-02-27 17:48:58.411	\N	default_farnoosh_mashreq	\N
message670	2025-11-09 00:00:00	11:52	95.18	AED	expense	cmm56s17600018ogeqghk7vfb	\N	۹۵.۱۸ درهم از پیتزا ae پیتزا گرفتیم31th October08:09 PM	\N	text	f	{}	2026-02-27 17:48:58.411	2026-02-27 17:48:58.411	\N	default_farnoosh_mashreq	\N
message671	2025-11-09 00:00:00	11:53	28.23	AED	expense	cmm56s17800028ogefz2eqqt0	\N	۲۸.۲۳ درهم دلستر خریدیم31th October08:25 PM	\N	text	f	{}	2026-02-27 17:48:58.411	2026-02-27 17:48:58.411	\N	default_farnoosh_mashreq	\N
message672	2025-11-09 00:00:00	11:56	70.00	AED	expense	cmm56s17900038ogeyynewip3	\N	سینا ۷۰ درهم پول بنزین برای کرتا داده1st November08:13 AM	\N	text	f	{}	2026-02-27 17:48:58.411	2026-02-27 17:48:58.411	\N	default_farnoosh_mashreq	\N
message673	2025-11-09 00:00:00	11:57	100.00	AED	expense	cmm56s17f00078oge3yf8pp6g	\N	۱۰۰ درهم پول بلیت سینما دادیم برای فیلم ناتور دشت۵۰تاش مال ماست2nd November06:57 PM	\N	text	f	{}	2026-02-27 17:48:58.411	2026-02-27 17:48:58.411	\N	default_farnoosh_mashreq	\N
message674	2025-11-09 00:00:00	11:59	100.00	AED	expense	cmm56s17900038ogeyynewip3	ENOC	خرید تگ سالیک برای مزدا	["Salik tag purchase for Mazda"]	image	t	{photos/photo_373@09-11-2025_11-59-02.jpg}	2026-02-27 17:48:58.411	2026-02-27 17:48:58.411	\N	default_farnoosh_mashreq	\N
message675	2025-11-09 00:00:00	12:00	373.65	AED	expense	cmm56s17600018ogeqghk7vfb	Zou Zou Restaurant	رستوران Zou Zou با نگین اینابهشون شیرینی ماشین دادیم2nd November11:42 PM	["Dinner at Zou Zou restaurant with Negin (treat for car handover)"]	image	t	{photos/photo_374@09-11-2025_12-00-48.jpg}	2026-02-27 17:48:58.411	2026-02-27 17:48:58.411	\N	default_farnoosh_mashreq	\N
message677	2025-11-09 00:00:00	12:06	38.00	AED	expense	cmm56s17800028ogefz2eqqt0	Waterfront Market	از میوه و تره‌بار waterfront سبزی کاهو و … خریدیم	["Vegetables, lettuce, greens"]	image	t	{photos/photo_376@09-11-2025_12-06-06.jpg}	2026-02-27 17:48:58.411	2026-02-27 17:48:58.411	\N	default_farnoosh_mashreq	\N
message679	2025-11-09 00:00:00	12:07	2.00	AED	expense	cmm56s17900038ogeyynewip3	Parkin	پول پارکینگ جلوی subway دادیم	["Parking near Subway"]	image	t	{photos/photo_377@09-11-2025_12-07-48.jpg}	2026-02-27 17:48:58.411	2026-02-27 17:48:58.411	\N	default_farnoosh_mashreq	\N
message680	2025-11-09 00:00:00	12:09	79.00	AED	expense	cmm56s17600018ogeqghk7vfb	Subway	غذا subway	["Food at Subway"]	image	t	{photos/photo_378@09-11-2025_12-09-30.jpg}	2026-02-27 17:48:58.411	2026-02-27 17:48:58.411	\N	default_farnoosh_mashreq	\N
message681	2025-11-09 00:00:00	12:10	137.00	AED	expense	cmm56s17800028ogefz2eqqt0	Azem Mirjalili General Trading	خرید میوه از سید کاظم میرجلیلی	["Pomegranate Irani 12.53","Cucumber 5.37","Mandarin Shomal 11.93","Orange Jonub 11.03","Sabo low fat yoghurt 1800g 17.00","Baharestan mint distillate 500g 5.00","Sahar tomato paste 680g 8.00","Mushroom pak 7.00","Sahar green olives pickle 640g 10.00","Alis plants doogh 1.5L 10.00","Haraz feta cheese 300g 10.00","Quince Irani 4.38","Persimmon Irani 10.00","Kiwi green 15.00"]	image	t	{photos/photo_379@09-11-2025_12-10-23.jpg}	2026-02-27 17:48:58.411	2026-02-27 17:48:58.411	\N	default_farnoosh_mashreq	\N
message682	2025-11-09 00:00:00	12:11	13.49	AED	expense	cmm56s17800028ogefz2eqqt0	Carrefour	\N	["Groceries from Carrefour"]	image	t	{photos/photo_380@09-11-2025_12-11-04.jpg}	2026-02-27 17:48:58.411	2026-02-27 17:48:58.411	\N	default_farnoosh_mashreq	\N
message683	2025-11-09 00:00:00	12:11	16.98	AED	expense	cmm56s17600018ogeqghk7vfb	Carrefour	غذای منوسینا در کارفورجمعا ۳۰.۴۷ درهم	["Food for Sina at Carrefour (total 30.47 AED per text)"]	image	t	{photos/photo_381@09-11-2025_12-11-05.jpg}	2026-02-27 17:48:58.411	2026-02-27 17:48:58.411	\N	default_farnoosh_mashreq	\N
message687	2025-11-09 00:00:00	12:14	2.00	AED	expense	cmm56s17900038ogeyynewip3	Parkin	پول پارکینگ جلوی رستوران Food Bazar	Parking at Food Bazar area	image	t	{photos/photo_384@09-11-2025_12-14-50.jpg}	2026-02-27 17:48:58.411	2026-02-27 17:48:58.411	\N	default_farnoosh_mashreq	\N
message688	2025-11-09 00:00:00	12:16	139.00	AED	expense	cmm56s17600018ogeqghk7vfb	Century Harvest Supermarket	غذا در Food Bazar	Food at Food Bazar	image	t	{photos/photo_385@09-11-2025_12-16-12.jpg}	2026-02-27 17:48:58.411	2026-02-27 17:48:58.411	\N	default_farnoosh_mashreq	\N
message689	2025-11-09 00:00:00	12:16	112.00	AED	expense	cmm56s17900038ogeyynewip3	ADNOC	اولین بنزین مزدا	First gas fill for Mazda	image	t	{photos/photo_386@09-11-2025_12-16-46.jpg}	2026-02-27 17:48:58.411	2026-02-27 17:48:58.411	\N	default_farnoosh_mashreq	\N
message690	2025-11-09 00:00:00	12:17	60.00	AED	expense	cmm56s17900038ogeyynewip3	Parkin	پول پارکینگ mall of emirates	Parking Mall of Emirates, 6.48 hours	file	t	{files/Safari.pdf}	2026-02-27 17:48:58.411	2026-02-27 17:48:58.411	\N	default_farnoosh_mashreq	\N
message685	2025-11-09 00:00:00	12:13	465.00	AED	expense	cmm5cqzf10001pw01d9pekwf0	Home Centre	خرید لوازم خونه از Homecentre	Seat cushion, placemat, serving bowls, spice jars, dinner set, serving bowl, lemon juicer	image	t	{photos/photo_383@09-11-2025_12-13-33.jpg}	2026-02-27 17:48:58.411	2026-02-28 09:10:42.653	\N	default_farnoosh_mashreq	\N
message692	2025-11-09 00:00:00	12:18	903.44	AED	expense	cmm56s17m000c8ogerjdoev6e	Tabby (Belhasa Driving Center)	قسط Tabby کلاس رانندگی فرنوش	Tabby installment for Farnoosh driving class | Tabby installment for Belhasa Driving Center	image	t	{photos/photo_388@09-11-2025_12-18-45.jpg,photos/photo_387@09-11-2025_12-18-45.jpg}	2026-02-27 17:48:58.411	2026-02-28 09:11:26.398	\N	default_farnoosh_mashreq	\N
message696	2025-11-09 00:00:00	12:24	107.18	AED	expense	cmm56s17600018ogeqghk7vfb	pizza.ae (Shaker Group)	پیتزا از pizza ae	Pizza from pizza.ae	image	t	{photos/photo_390@09-11-2025_12-24-34.jpg}	2026-02-27 17:48:58.411	2026-02-27 17:48:58.411	\N	default_farnoosh_mashreq	\N
message698	2025-11-15 00:00:00	23:43	100.00	AED	expense	cmm56s17a00048ogeacrpia4x	du	اینترنت خط سینا	Internet for Sina's line	image	t	{photos/photo_391@15-11-2025_23-43-50.jpg}	2026-02-27 17:48:58.411	2026-02-27 17:48:58.411	\N	default_farnoosh_mashreq	\N
message699	2025-11-15 00:00:00	23:44	100.84	AED	expense	cmm56s17800028ogefz2eqqt0	Geant Express	Geant	Banana, onion, garlic, toilet cleaner, black pepper, chicken	image	t	{photos/photo_392@15-11-2025_23-44-25.jpg}	2026-02-27 17:48:58.411	2026-02-27 17:48:58.411	\N	default_farnoosh_mashreq	\N
message703	2025-11-15 00:00:00	23:47	6.00	AED	expense	cmm56s17900038ogeyynewip3	Parking	پارکینگ جلوی subway	Parking near Subway	image	t	{photos/photo_394@15-11-2025_23-47-33.jpg}	2026-02-27 17:48:58.411	2026-02-27 17:48:58.411	\N	default_farnoosh_mashreq	\N
message704	2025-11-15 00:00:00	23:49	149.00	AED	expense	cmm56s17600018ogeqghk7vfb	Subway	Subway	Subway restaurant meal	image	t	{photos/photo_395@15-11-2025_23-49-26.jpg}	2026-02-27 17:48:58.411	2026-02-27 17:48:58.411	\N	default_farnoosh_mashreq	\N
message705	2025-11-15 00:00:00	23:50	37.00	AED	expense	cmm56s17900038ogeyynewip3	ENOC	کارواش اتوماتیک	Automatic car wash at ENOC	image	t	{photos/photo_396@15-11-2025_23-50-18.jpg}	2026-02-27 17:48:58.411	2026-02-27 17:48:58.411	\N	default_farnoosh_mashreq	\N
message706	2025-11-15 00:00:00	23:50	6.00	AED	expense	cmm56s17900038ogeyynewip3	Parking	پارکینگ جلوی دی تو دی	Parking near Day to Day	image	t	{photos/photo_397@15-11-2025_23-50-41.jpg}	2026-02-27 17:48:58.411	2026-02-27 17:48:58.411	\N	default_farnoosh_mashreq	\N
message707	2025-11-15 00:00:00	23:51	105.09	AED	expense	cmm56s17800028ogefz2eqqt0	Day to Day	دی تو دیDay to day	Popcorn, banana, apple, strawberry, passion fruit, mushroom, kiwi, avocado, Clorox, DAC toilet cleaner	image	t	{photos/photo_398@15-11-2025_23-51-08.jpg}	2026-02-27 17:48:58.411	2026-02-27 17:48:58.411	\N	default_farnoosh_mashreq	\N
message709	2025-11-15 00:00:00	23:52	2.00	AED	expense	cmm56s17900038ogeyynewip3	Parking	پارکینگ جلوی دی تو دی	Parking near Day to Day	image	t	{photos/photo_399@15-11-2025_23-52-14.jpg}	2026-02-27 17:48:58.411	2026-02-27 17:48:58.411	\N	default_farnoosh_mashreq	\N
message710	2025-11-15 00:00:00	23:52	139.65	AED	expense	cmm56s17600018ogeqghk7vfb	Kebab Khodmooni	کباب خودمونی	Chicken kebab, lamb tikka, doogh, sangak bread	image	t	{photos/photo_400@15-11-2025_23-52-35.jpg}	2026-02-27 17:48:58.411	2026-02-27 17:48:58.411	\N	default_farnoosh_mashreq	\N
message718	2025-11-21 00:00:00	09:27	16.00	AED	expense	cmm56s17800028ogefz2eqqt0	\N	سینا ۱۶ درهم از سوپرمارکت پایین خونه تخم مرغ خریده17th November10:58 AM	\N	text	f	{}	2026-02-27 17:48:58.411	2026-02-27 17:48:58.411	\N	default_farnoosh_mashreq	\N
message697	2025-11-09 00:00:00	12:27	26.25	AED	expense	cmm56s17a00048ogeacrpia4x	\N	۲۶.۲۵ درهم بانک بابت paper statement از حسابم کم کرده8th November09:20 AM	\N	text	f	{}	2026-02-27 17:48:58.411	2026-02-28 09:12:21.955	\N	default_farnoosh_mashreq	\N
message701	2025-11-15 00:00:00	23:45	282.00	AED	expense	cmm5cqzf10001pw01d9pekwf0	Pan Home	Panhome	Bamboo storage set, bamboo basket, Primo fingerprint resistant items	image	t	{photos/photo_393@15-11-2025_23-45-17.jpg}	2026-02-27 17:48:58.411	2026-02-28 09:12:32.982	\N	default_farnoosh_mashreq	\N
message719	2025-11-21 00:00:00	09:30	80.00	AED	expense	cmm56s17a00048ogeacrpia4x	\N	۸۰ درهم بابت تعمیر کمد اتاق به Latinem پول دادیم17th November11:19 AM	\N	text	f	{}	2026-02-27 17:48:58.411	2026-02-28 09:15:16.952	\N	default_farnoosh_mashreq	\N
message712	2025-11-15 00:00:00	23:53	179.33	AED	expense	cmm56s17g00088oge05l6cktv	Tabby	قسط سوم تامارا برای خرید کتونی جفتمون از اسکیچرزSkechersکتونی اسکیچرز هرکدوممون ۲۶۹ درهم - جمعا ۵۳۸ درهم	3rd installment payment	image	t	{photos/photo_401@15-11-2025_23-53-55.jpg,photos/photo_402@15-11-2025_23-53-55.jpg}	2026-02-27 17:48:58.411	2026-02-28 10:37:20.985	\N	default_farnoosh_mashreq	\N
message717	2025-11-15 00:00:00	23:58	76.33	AED	expense	cmm56s17g00088oge05l6cktv	Apparel Group Stores UAE (Skechers)	قسط سوم تامارا برای خرید کتونی بابای سینا از اسکیچرزSkechersجمعا ۲۲۹ درهم	["Skechers shoes (Tamara installment 3 of 3, total 229)"] | 3rd installment payment	image	t	{photos/photo_406@15-11-2025_23-58-12.jpg,photos/photo_405@15-11-2025_23-58-12.jpg}	2026-02-27 17:48:58.411	2026-02-28 10:38:49.682	\N	default_farnoosh_mashreq	\N
message714	2025-11-15 00:00:00	23:57	252.68	AED	expense	cmm56s17g00088oge05l6cktv	\N	قسط سوم تامارا برای خرید کتونی جفتمون از نایکNike Jordanکتونی نایک هرکدوممون ۳۷۹ درهم - جمعا ۷۵۸ درهم	Sports store purchase via Tabby	image	t	{photos/photo_403@15-11-2025_23-57-34.jpg,photos/photo_404@15-11-2025_23-57-34.jpg}	2026-02-27 17:48:58.411	2026-02-28 10:38:23.609	\N	default_farnoosh_mashreq	\N
message715	2025-11-15 00:00:00	23:57	758.00	AED	expense	cmm56s17g00088oge05l6cktv	Sun & Sand Sports	\N	Sports store purchase via Tabby	image	t	{photos/photo_404@15-11-2025_23-57-34.jpg}	2026-02-27 17:48:58.411	2026-02-28 10:38:23.609	message714	default_farnoosh_mashreq	\N
message722	2025-11-21 00:00:00	09:46	24.00	AED	expense	cmm56s17800028ogefz2eqqt0	Royal Corn Foodstuff T	خرید ذرت مکزیکی در پاساژ oasis mall	["Corn (Mexican corn at Oasis Mall passage)"]	image	t	{photos/photo_409@21-11-2025_09-46-48.jpg}	2026-02-27 17:48:58.411	2026-02-27 17:48:58.411	\N	default_farnoosh_mashreq	\N
message720	2025-11-21 00:00:00	09:45	135.92	AED	expense	cmm5cqzf10001pw01d9pekwf0	Amazon	قسط اول تامارا بابت خرید از آمازون برای لوازم خونه	["Home supplies from Amazon (Tamara installment 1 of 4, total 543.65)"]	image	t	{photos/photo_407@21-11-2025_09-45-00.jpg}	2026-02-27 17:48:58.411	2026-02-28 09:15:28.73	\N	default_farnoosh_mashreq	\N
message721	2025-11-21 00:00:00	09:45	22.50	AED	expense	cmm5cqzf10001pw01d9pekwf0	Landmark Group (Home Box)	قسط اول‌ تامارا بابت خرید جای سیب زمینی و پیاز از homebox	["Potato and onion storage basket from Home Box (Tamara installment 1 of 4, total 90)"]	image	t	{photos/photo_408@21-11-2025_09-45-36.jpg}	2026-02-27 17:48:58.411	2026-02-28 09:15:38.261	\N	default_farnoosh_mashreq	\N
message726	2025-11-21 00:00:00	09:51	39.00	AED	expense	cmm56s17600018ogeqghk7vfb	Subway	subway	["Subway meal"]	image	t	{photos/photo_413@21-11-2025_09-51-39.jpg}	2026-02-27 17:48:58.411	2026-02-27 17:48:58.411	\N	default_farnoosh_mashreq	\N
message727	2025-11-21 00:00:00	09:52	52.00	AED	expense	cmm56s17600018ogeqghk7vfb	Hatam	رستوران حاتم	["Restaurant meal at Hatam"]	image	t	{photos/photo_414@21-11-2025_09-52-15.jpg}	2026-02-27 17:48:58.411	2026-02-27 17:48:58.411	\N	default_farnoosh_mashreq	\N
message723	2025-11-21 00:00:00	09:48	12.00	AED	expense	cmm5cqzf10001pw01d9pekwf0	Home Box LLC	حوله دستشویی از homebox	["Essential Corded Hand Towel 50x90 cm - Sand"]	image	t	{photos/photo_410@21-11-2025_09-48-48.jpg}	2026-02-27 17:48:58.411	2026-02-28 09:15:53.023	\N	default_farnoosh_mashreq	\N
message737	2025-11-21 00:00:00	10:00	157.00	AED	expense	cmm56s17800028ogefz2eqqt0	Azem Mirjalili General Trading	سید کاظم میرجلیلی	["Mix veg (6.01)","Passion fruit (20.00)","Lettuce romaine (4.60)","Persimmon Irani (5.00)","Peach Irani kg (15.00)","Pomegranate Irani kg (12.90)","Blueberry 125g (10.00)","Strawberry 250g (1.00)","Cherry Africa (30.60)","Carrot Irani kg (2.74)","Badar mixed berry jam 300g (8.00)","Mara Googheh cheese 400ml (12.00)","Kalleh Dooogh 1.5L (11.00)","Alis Mint 1.5L (10.00)"]	image	t	{photos/photo_416@21-11-2025_10-00-29.jpg}	2026-02-27 17:48:58.411	2026-02-27 17:48:58.411	\N	default_farnoosh_mashreq	\N
message738	2025-11-21 00:00:00	10:01	20.77	AED	expense	cmm56s17600018ogeqghk7vfb	Carrefour	غذا در کارفور	["Food at Carrefour"]	image	t	{photos/photo_417@21-11-2025_10-01-34.jpg}	2026-02-27 17:48:58.411	2026-02-27 17:48:58.411	\N	default_farnoosh_mashreq	\N
message739	2025-11-21 00:00:00	10:02	389.63	AED	expense	cmm56s17800028ogefz2eqqt0	Carrefour	خرید از کارفور	["Norwegian salmon","Aus BF mince 1kg","Veal meat cubes","Aly fillet 600g","Dates Medjool","Poliva","Cinnamon sticks","LCA avocados","Gardenia 60x45x18","Tomato paste 1.5kg","Low compact topper set","Deluxe sandwich","Deluxe sandwich PR","EWF organic cocnt","Palestinian tea fork GP","Shawarma cuisine","Fresh herbs bunch","Other grocery items"]	image	t	{photos/photo_418@21-11-2025_10-02-32.jpg}	2026-02-27 17:48:58.411	2026-02-27 17:48:58.411	\N	default_farnoosh_mashreq	\N
message742	2025-11-21 00:00:00	18:53	35.00	AED	expense	cmm56s17900038ogeyynewip3	National Parking Co Ltd (DXB Airport)	پول پارکینگ فرودگاه	["Airport parking - Dubai Airport Terminal 1"]	image	t	{photos/photo_420@21-11-2025_18-53-42.jpg}	2026-02-27 17:48:58.411	2026-02-27 17:48:58.411	\N	default_farnoosh_mashreq	\N
message743	2025-11-21 00:00:00	18:55	100.00	AED	expense	cmm56s17900038ogeyynewip3	Salik	شارژ حساب سالیک	["Salik account recharge (vehicle Dubai V 18602)"]	image	t	{photos/photo_421@21-11-2025_18-55-08.jpg}	2026-02-27 17:48:58.411	2026-02-27 17:48:58.411	\N	default_farnoosh_mashreq	\N
message744	2025-11-21 00:00:00	18:56	203.00	AED	expense	cmm56s17600018ogeqghk7vfb	Rivas	ریواس	["Chicken Tikkah Maasti (77.00)","Kabab Koobideh Lamb (77.00)","Doogh (12.00)","Water Small (12.00)","Salad Shirazi (25.00)"]	image	t	{photos/photo_422@21-11-2025_18-56-41.jpg}	2026-02-27 17:48:58.411	2026-02-27 17:48:58.411	\N	default_farnoosh_mashreq	\N
message745	2025-11-22 00:00:00	20:46	50.00	AED	expense	cmm56s17600018ogeqghk7vfb	12 Carts Rest. Mngt.	بستنی محوطه دبی مال	["Ice cream / dessert at Dubai Mall"]	image	t	{photos/photo_423@22-11-2025_20-46-28.jpg}	2026-02-27 17:48:58.411	2026-02-27 17:48:58.411	\N	default_farnoosh_mashreq	\N
message746	2025-11-22 00:00:00	20:46	177.85	AED	expense	cmm56s17600018ogeqghk7vfb	Paul	Paul	["Vol Aux Croll (68.00)","Tagliatelle Chicken Pasta (76.00)","Mojito Passion Fruit (32.00)","Service Fee (1.85)"]	image	t	{photos/photo_424@22-11-2025_20-46-34.jpg}	2026-02-27 17:48:58.411	2026-02-27 17:48:58.411	\N	default_farnoosh_mashreq	\N
message728	2025-11-21 00:00:00	09:52	8000.00	AED	income	cmm56s17i00098oge2xb5or4t	Mashreq Bank	کارت به کارت از حساب شرکت به حساب خودم	["Fund transfer from company account (Farnoosh Bagheri Project Management) to personal account (Farnoosh Bagheri)"]	file	t	{files/M191125297379WAM.PDF}	2026-02-27 17:48:58.411	2026-02-28 09:16:19.518	\N	default_farnoosh_mashreq	\N
message736	2025-11-21 00:00:00	09:59	178.50	AED	expense	cmm56s17j000a8ogezifv1oi1	717 Gents Salon	کوتاهی مو و ریش سینا	["Haircut and beard trim"]	image	t	{photos/photo_415@21-11-2025_09-59-49.jpg}	2026-02-27 17:48:58.411	2026-02-28 09:19:09.64	\N	default_farnoosh_mashreq	\N
message732	2025-11-21 00:00:00	09:56	793.59	AED	expense	cmm56s17a00048ogeacrpia4x	Sobha Smart Bill Services	قبضOctoberبابت chilled and hot water	["Thermal energy charges (62.34 AED)","Billing service fee (26.25 AED)","Previous bill balance (705.00 AED)","Chilled and hot water - October bill"]	file	t	{files/SSBS-D-307313.pdf}	2026-02-27 17:48:58.411	2026-02-28 09:18:32.712	message734	default_farnoosh_mashreq	\N
message735	2025-11-21 00:00:00	09:58	600.00	AED	expense	cmm56s17a00048ogeacrpia4x	Sobha Smart Bill Services	امضای قرارداد بین من و sobhaبابتChilled and hot water	["Chilled water billing service agreement - security deposit for unit RB-509 Sobha Creek Vistas Reserve"]	file	t	{files/Documents_for_your_DocuSign_Signature.pdf}	2026-02-27 17:48:58.411	2026-02-28 09:18:32.712	message734	default_farnoosh_mashreq	\N
message741	2025-11-21 00:00:00	10:03	18.99	AED	expense	cmm5cqzf10001pw01d9pekwf0	Carrefour	خرید از کارفور	["Dettol Cleaner 500ml"]	image	t	{photos/photo_419@21-11-2025_10-03-19.jpg}	2026-02-27 17:48:58.411	2026-02-28 10:40:01.029	\N	default_farnoosh_mashreq	\N
cmm8zcne000078omxjlszen0e	2026-03-02 09:32:07.655	\N	100.00	USD	expense	cmm56s17800028ogefz2eqqt0	Seyed Kazem Mirjalili	سید کاظم میرجلیلی 	\N	telegram	t	{cmm8zcne000078omxjlszen0e/1a2a9a33-c6f0-4b2f-bc08-02b9449eb399.jpg}	2026-03-02 09:32:07.656	2026-03-02 18:52:37.141	\N	default_farnoosh_mashreq	\N
cmm7x74nn00018orqsz4egwr8	2026-03-01 15:44:04.691	\N	500.00	AED	expense	\N	restaurant	\N	\N	telegram	f	\N	2026-03-01 15:44:04.692	2026-03-02 19:30:40.578	\N	default_farnoosh_mashreq	\N
cmmabw69h00018ox2imtnt591	2026-03-03 08:11:00.149	\N	500.00	AED	expense	\N	درهم با دستگاه ATM به حسابم گذاشتم	25th February	\N	telegram	f	\N	2026-03-03 08:11:00.149	2026-03-03 09:45:24.763	\N	default_farnoosh_mashreq	3
message747	2025-11-23 00:00:00	16:30	28.55	AED	expense	cmm56s17800028ogefz2eqqt0	Choithrams	CHOITHRAMS	["Shopping bag (0.25)","Oxo Bio bag 50x60 (9.95)","Bayader clear cups with handle (3.95)","Drink 500ml (6.50)","VB Garlic Baguette 250g (not priced separately)","VB Baguette White 400g (7.90)"]	image	t	{photos/photo_425@23-11-2025_16-30-11.jpg}	2026-02-27 17:48:58.411	2026-02-27 17:48:58.411	\N	default_farnoosh_mashreq	\N
message748	2025-11-23 00:00:00	16:31	92.04	AED	expense	cmm56s17900038ogeyynewip3	ENOC	بنزین	["Fuel/Petrol"]	image	t	{photos/photo_426@23-11-2025_16-31-08.jpg}	2026-02-27 17:48:58.411	2026-02-27 17:48:58.411	\N	default_farnoosh_mashreq	\N
message749	2025-11-23 00:00:00	16:31	60.00	AED	expense	cmm56s17900038ogeyynewip3	Parkonic	پارکینگ JBR	["Parking at The Beach - JBR (3 hours)"]	image	t	{photos/photo_427@23-11-2025_16-31-26.jpg}	2026-02-27 17:48:58.411	2026-02-27 17:48:58.411	\N	default_farnoosh_mashreq	\N
message751	2025-11-24 00:00:00	22:20	147.00	AED	expense	cmm56s17f00078oge3yf8pp6g	Dubai Miracle Garden	بلیت باغ گلMiracle Garden	["Entrance tickets to Miracle Garden"]	image	t	{photos/photo_429@24-11-2025_22-20-57.jpg}	2026-02-27 17:48:58.411	2026-02-27 17:48:58.411	\N	default_farnoosh_mashreq	\N
message752	2025-11-24 00:00:00	22:21	85.00	AED	expense	cmm56s17600018ogeqghk7vfb	Shireen Elzohary Culin	نوشیدنی در باغ گل	["Drinks at Miracle Garden area"]	image	t	{photos/photo_430@24-11-2025_22-21-31.jpg}	2026-02-27 17:48:58.411	2026-02-27 17:48:58.411	\N	default_farnoosh_mashreq	\N
message753	2025-11-24 00:00:00	22:21	53.50	AED	expense	cmm56s17800028ogefz2eqqt0	Choithrams	CHOITHRAMS	["Groceries"]	image	t	{photos/photo_431@24-11-2025_22-21-46.jpg}	2026-02-27 17:48:58.411	2026-02-27 17:48:58.411	\N	default_farnoosh_mashreq	\N
message754	2025-11-24 00:00:00	22:23	47.80	AED	expense	cmm56s17800028ogefz2eqqt0	Geant Express	Geant	["Farm Fresh Eggs","Loaf Rye Bread","Mono Oreo Cake"]	image	t	{photos/photo_432@24-11-2025_22-23-52.jpg}	2026-02-27 17:48:58.411	2026-02-27 17:48:58.411	\N	default_farnoosh_mashreq	\N
message755	2025-11-27 00:00:00	10:19	91.55	AED	expense	cmm56s17800028ogefz2eqqt0	Choithrams	CHOITHRAMS	["Beetroot","Tomato Plums Bunch Holland","Lemon South Africa","Cucumber","Banana Chiquita Ecuador","Avocado Ready to Eat (1M) x2","Mushroom Local 250g","Holsten NAMB Black Grape 330ml","Holsten Mojito 330ml","Holsten Non-Alcoholic Beer Pomegranate 330ml","Shopping Bag OXO BIO 50x60"]	image	t	{photos/photo_433@27-11-2025_10-19-28.jpg}	2026-02-27 17:48:58.411	2026-02-27 17:48:58.411	\N	default_farnoosh_mashreq	\N
message750	2025-11-23 00:00:00	16:51	141.56	AED	expense	cmm5cqzf10001pw01d9pekwf0	Tabby	پرداخت قسط دوم Tabby بابت عینک سیناکلش ۵۶۶.۲۵ درهم شد	["Card repayment - 2nd installment for glasses (Tabby)"]	image	t	{photos/photo_428@23-11-2025_16-51-50.jpg}	2026-02-27 17:48:58.411	2026-02-28 09:19:48.817	\N	default_farnoosh_mashreq	\N
message759	2025-11-29 00:00:00	00:00	200.00	AED	expense	cmm56s17900038ogeyynewip3	Salik	شارژ حساب سالیک۲۰۰ درهم	["Salik account recharge (200 AED)"]	image	t	{photos/photo_434@29-11-2025_00-00-06.jpg}	2026-02-27 17:48:58.411	2026-02-27 17:48:58.411	\N	default_farnoosh_mashreq	\N
message760	2025-11-29 00:00:00	00:02	75.00	AED	expense	cmm56s17f00078oge3yf8pp6g	\N	۷۵ درهم ورودی Global Village برای سه نفرمون27th November07:17 PM	\N	text	f	{}	2026-02-27 17:48:58.411	2026-02-27 17:48:58.411	\N	default_farnoosh_mashreq	\N
message761	2025-11-29 00:00:00	00:07	25.00	AED	expense	cmm56s17600018ogeqghk7vfb	Best Tavan General Trad	فالوده شیرازی در global village	["Falooda Shirazi at Global Village"]	image	t	{photos/photo_435@29-11-2025_00-07-04.jpg}	2026-02-27 17:48:58.411	2026-02-27 17:48:58.411	\N	default_farnoosh_mashreq	\N
message762	2025-11-29 00:00:00	00:08	20.00	AED	expense	cmm56s17600018ogeqghk7vfb	Noqodi Gv Tur	خرید سیمیت در global village	["Cement/Simeet purchase at Global Village"]	image	t	{photos/photo_436@29-11-2025_00-08-25.jpg}	2026-02-27 17:48:58.48	2026-02-27 17:48:58.48	\N	default_farnoosh_mashreq	\N
message763	2025-11-29 00:00:00	00:09	30.00	AED	expense	cmm56s17600018ogeqghk7vfb	Noqodi Gv Tur	خرید باقلوا در global village	["Baklava at Global Village"]	image	t	{photos/photo_437@29-11-2025_00-09-08.jpg}	2026-02-27 17:48:58.48	2026-02-27 17:48:58.48	\N	default_farnoosh_mashreq	\N
message764	2025-11-29 00:00:00	00:10	25.00	AED	expense	cmm56s17600018ogeqghk7vfb	Noqodi Gv Tur	دلمه در global village	["Dolmeh at Global Village"]	image	t	{photos/photo_438@29-11-2025_00-10-01.jpg}	2026-02-27 17:48:58.48	2026-02-27 17:48:58.48	\N	default_farnoosh_mashreq	\N
message765	2025-11-29 00:00:00	00:11	120.00	AED	expense	cmm56s17900038ogeyynewip3	Parkonic Parking	پول پارکینگ global village	["Parking at Global Village"]	image	t	{photos/photo_439@29-11-2025_00-11-07.jpg}	2026-02-27 17:48:58.48	2026-02-27 17:48:58.48	\N	default_farnoosh_mashreq	\N
message766	2025-11-29 00:00:00	00:11	4.00	AED	expense	cmm56s17900038ogeyynewip3	Dubai Municipality Parking	پارکینگ جلوی عروس دمشق	["Parking near Aroos Damashq restaurant (1 hour)"]	image	t	{photos/photo_440@29-11-2025_00-11-33.jpg}	2026-02-27 17:48:58.48	2026-02-27 17:48:58.48	\N	default_farnoosh_mashreq	\N
message767	2025-11-29 00:00:00	00:11	92.00	AED	expense	cmm56s17600018ogeqghk7vfb	Aroos Damashq Restaurant	عروس دمشق	["Chicken Tikka (47.00)","Chicken Shawarma Sandwich (12.00)","Baba Ghanouj (25.00)","Large Mineral Water (8.00)"]	image	t	{photos/photo_441@29-11-2025_00-11-51.jpg}	2026-02-27 17:48:58.48	2026-02-27 17:48:58.48	\N	default_farnoosh_mashreq	\N
message768	2025-11-29 00:00:00	00:12	105.00	AED	expense	cmm56s17900038ogeyynewip3	The Palm Jumeirah Co	بلیت مونوریل پالم برای سه نفرمون	["Palm Monorail tickets for 3 persons"]	image	t	{photos/photo_442@29-11-2025_00-12-55.jpg}	2026-02-27 17:48:58.48	2026-02-27 17:48:58.48	\N	default_farnoosh_mashreq	\N
message769	2025-11-29 00:00:00	00:13	193.01	AED	expense	cmm56s17600018ogeqghk7vfb	Paul	Paul	["Dining at Paul restaurant"]	image	t	{photos/photo_443@29-11-2025_00-13-30.jpg}	2026-02-27 17:48:58.48	2026-02-27 17:48:58.48	\N	default_farnoosh_mashreq	\N
message771	2025-11-29 00:00:00	22:33	26.00	AED	expense	cmm56s17900038ogeyynewip3	Focus Vision Car Wash	بابت شستن ماشین جلوی پاساژ ابن بطوطه	["Car wash near Ibn Battuta"]	image	t	{photos/photo_444@29-11-2025_22-33-22.jpg}	2026-02-27 17:48:58.48	2026-02-27 17:48:58.48	\N	default_farnoosh_mashreq	\N
message772	2025-11-29 00:00:00	22:33	30.66	AED	expense	cmm56s17600018ogeqghk7vfb	Carrefour	غذا در کارفور	["Food at Carrefour"]	image	t	{photos/photo_445@29-11-2025_22-33-48.jpg}	2026-02-27 17:48:58.48	2026-02-27 17:48:58.48	\N	default_farnoosh_mashreq	\N
message774	2025-11-29 00:00:00	22:35	24.63	AED	expense	cmm56s17600018ogeqghk7vfb	Carrefour	غذا در کارفور	["Food at Carrefour"]	image	t	{photos/photo_447@29-11-2025_22-35-14.jpg}	2026-02-27 17:48:58.48	2026-02-27 17:48:58.48	\N	default_farnoosh_mashreq	\N
message775	2025-11-29 00:00:00	22:35	416.85	AED	expense	cmm56s17800028ogefz2eqqt0	Carrefour (Majid Al Futtaim)	خرید در کارفور	["Groceries shopping at Carrefour Ibn Battuta"]	image	t	{photos/photo_448@29-11-2025_22-35-54.jpg}	2026-02-27 17:48:58.48	2026-02-27 17:48:58.48	\N	default_farnoosh_mashreq	\N
message770	2025-11-29 00:00:00	00:15	297.00	AED	expense	cmm56s17f00078oge3yf8pp6g	\N	۲۹۷ درهم Palm view برای سه نفرمون28th November02:02 PM	\N	text	f	{}	2026-02-27 17:48:58.48	2026-02-28 09:21:50.433	\N	default_farnoosh_mashreq	\N
message773	2025-11-29 00:00:00	22:34	100.00	AED	expense	cmm56s17g00088oge05l6cktv	Landmark Retail	سوغاتی مامان برای برکه	["Gift/souvenir for mothers for Barkeh"]	image	t	{photos/photo_446@29-11-2025_22-34-39.jpg}	2026-02-27 17:48:58.48	2026-02-28 09:22:17.502	\N	default_farnoosh_mashreq	\N
message779	2025-12-04 00:00:00	14:43	10.50	AED	expense	cmm56s17900038ogeyynewip3	Mohammad Ishaq Car Park	پول پارکینگ جلوی قاب دبی	["Parking near Dubai Frame"]	image	t	{photos/photo_451@04-12-2025_14-43-47.jpg}	2026-02-27 17:48:58.48	2026-02-27 17:48:58.48	\N	default_farnoosh_mashreq	\N
message780	2025-12-04 00:00:00	14:48	156.00	AED	expense	cmm56s17600018ogeqghk7vfb	Food Bazaar Jumeirah	غذا در فود بازار	["Ghalieh Mahi Stew (45.00)","Saffron rice (29.00)","Mineral Water Large (20.00)","Zeytoon Parvardeh (20.00)","Joojeh Kabab Boneless (42.00)"]	image	t	{photos/photo_452@04-12-2025_14-48-11.jpg}	2026-02-27 17:48:58.48	2026-02-27 17:48:58.48	\N	default_farnoosh_mashreq	\N
message781	2025-12-04 00:00:00	14:49	113.00	AED	expense	cmm56s17900038ogeyynewip3	ADNOC 505	بنزین	["Fuel/petrol"]	image	t	{photos/photo_453@04-12-2025_14-49-14.jpg}	2026-02-27 17:48:58.48	2026-02-27 17:48:58.48	\N	default_farnoosh_mashreq	\N
message783	2025-12-04 00:00:00	15:02	30.00	AED	expense	cmm56s17a00048ogeacrpia4x	du	اینترنت سینا	["Internet recharge (Flexi plan, mobile 971551507311)"]	image	t	{photos/photo_454@04-12-2025_15-02-56.jpg}	2026-02-27 17:48:58.48	2026-02-27 17:48:58.48	\N	default_farnoosh_mashreq	\N
message784	2025-12-04 00:00:00	15:03	24.00	AED	expense	cmm56s17600018ogeqghk7vfb	Starbucks	Starbucksفرودگاه	["Starbucks (airport)"]	image	t	{photos/photo_455@04-12-2025_15-03-47.jpg}	2026-02-27 17:48:58.48	2026-02-27 17:48:58.48	\N	default_farnoosh_mashreq	\N
message786	2025-12-04 00:00:00	15:04	30.00	AED	expense	cmm56s17900038ogeyynewip3	Mawgif	\N	["Parking (airport)"]	image	t	{photos/photo_456@04-12-2025_15-04-26.jpg}	2026-02-27 17:48:58.48	2026-02-27 17:48:58.48	\N	default_farnoosh_mashreq	\N
message787	2025-12-04 00:00:00	15:04	30.00	AED	expense	cmm56s17900038ogeyynewip3	Dubai Airport Parking T1B	پارکینگ فرودگاه	["Airport parking"]	image	t	{photos/photo_457@04-12-2025_15-04-26.jpg}	2026-02-27 17:48:58.48	2026-02-27 17:48:58.48	\N	default_farnoosh_mashreq	\N
message777	2025-12-04 00:00:00	14:42	47.26	AED	expense	cmm56s17f00078oge3yf8pp6g	Platinumlist	۴۷.۲۶ درهم قسط اول تبی برای بلیت قاب دبیکلش ۱۴۱.۷۶ درهم شد	["Dubai Frame ticket (installment 1 of 3, total 141.76)"] | ["Dubai Frame ticket (pay in 3 schedule: 47.26 + 47.25 + 47.25)"]	image	t	{photos/photo_449@04-12-2025_14-42-22.jpg,photos/photo_450@04-12-2025_14-42-22.jpg}	2026-02-27 17:48:58.48	2026-02-28 09:22:41.521	\N	default_farnoosh_mashreq	\N
message778	2025-12-04 00:00:00	14:42	141.76	AED	expense	cmm56s17f00078oge3yf8pp6g	Platinumlist	\N	["Dubai Frame ticket (pay in 3 schedule: 47.26 + 47.25 + 47.25)"]	image	t	{photos/photo_450@04-12-2025_14-42-22.jpg}	2026-02-27 17:48:58.48	2026-02-28 09:22:41.521	message777	default_farnoosh_mashreq	\N
message790	2025-12-06 00:00:00	23:35	33.94	AED	expense	cmm56s17a00048ogeacrpia4x	Arabian Unigaz	قبض گاز	["Gas bill (LPG 1.150 x 7 = 8.86, Service Charge 23.475, Total inc VAT 33.941)"]	image	t	{photos/photo_460@06-12-2025_23-35-46.jpg}	2026-02-27 17:48:58.48	2026-02-27 17:48:58.48	\N	default_farnoosh_mashreq	\N
message793	2025-12-06 00:00:00	23:37	59.75	AED	expense	cmm56s17g00088oge05l6cktv	SKECHERS Ibn Battuta Mall	\N	["Skechers (Tabby installment 1 of 4, total 239.00, paid 6 Dec)"]	image	t	{photos/photo_463@06-12-2025_23-37-00.jpg}	2026-02-27 17:48:58.48	2026-02-27 17:48:58.48	\N	default_farnoosh_mashreq	\N
message794	2025-12-06 00:00:00	23:37	65.62	AED	expense	cmm56s17g00088oge05l6cktv	LC WAIKIKI Ibn Battuta Mall	قسط‌های تبی	["LC Waikiki (Tabby installment 1 of 4, total 262.50, paid 6 Dec)"]	image	t	{photos/photo_464@06-12-2025_23-37-00.jpg}	2026-02-27 17:48:58.48	2026-02-27 17:48:58.48	\N	default_farnoosh_mashreq	\N
message795	2025-12-12 00:00:00	14:25	56.65	AED	expense	cmm56s17800028ogefz2eqqt0	Roots Supermarket	خرید از Roots	["VkusVill Double-Layer Vanilla And Chocolate Ice Cream 80g (9.00)","VkusVill Vanilla Ice Cream Bar In Banana Jelly 80g (6.25)","Roots Eggs Large White 15S 750g (19.50)","Multigrain Sourdough Bread 215g (14.00)","Roots Green Apple kg (5.20)","Banana Chiquita kg (2.70)"]	image	t	{photos/photo_465@12-12-2025_14-25-55.jpg}	2026-02-27 17:48:58.48	2026-02-27 17:48:58.48	\N	default_farnoosh_mashreq	\N
message782	2025-12-04 00:00:00	15:01	40.38	AED	expense	cmm5cqzf10001pw01d9pekwf0	Amazon.ae	کاور چمدون از آمازون	["AMERTEER 3Pcs Luggage Cover Protector Set (32.38)","Shipping & Handling (8.00)"]	file	t	{"files/Order Details (1).pdf"}	2026-02-27 17:48:58.48	2026-02-28 09:23:00.993	\N	default_farnoosh_mashreq	\N
message792	2025-12-06 00:00:00	23:37	903.43	AED	expense	cmm56s17m000c8ogerjdoev6e	Belhasa Driving Center	\N	["Driving center installment (payment 4 of 4, total 3613.75, paid 6 Dec)"]	image	t	{photos/photo_462@06-12-2025_23-37-00.jpg}	2026-02-27 17:48:58.48	2026-02-28 09:24:00.851	\N	default_farnoosh_mashreq	\N
message798	2025-12-12 00:00:00	14:29	65.26	AED	expense	cmm56s17800028ogefz2eqqt0	Geant Express	Geant	["Mushroom White G (7.95)","Protein Cracker (18.95)","Avocado Ready To (2.46)","Banana Chiquita (4.50)","Torabika Cappuci (9.85)","Colgate Toothpas (11.95)","Bread Kraftkorn (SO & 5)"]	image	t	{photos/photo_466@12-12-2025_14-29-34.jpg}	2026-02-27 17:48:58.48	2026-02-27 17:48:58.48	\N	default_farnoosh_mashreq	\N
message800	2025-12-12 00:00:00	14:31	85.10	AED	expense	cmm56s17800028ogefz2eqqt0	Geant Express	Geant	["Ciabatta Bread G x2 (6.60)","Lusine Brown San (2.80)","Lusine Brown San x2 (65.50)","Alyoum Chicken B (9.95)","Organic Sweet Co (0.25)"]	image	t	{photos/photo_467@12-12-2025_14-31-15.jpg}	2026-02-27 17:48:58.48	2026-02-27 17:48:58.48	\N	default_farnoosh_mashreq	\N
message797	2025-12-12 00:00:00	14:27	4000.00	AED	income	cmm56s17i00098oge2xb5or4t	Mashreq Bank	کارت به کارت از حساب شرکت به حساب خودم	["Fund transfer from company account (Farnoosh Bagheri Project Management) to personal account (Farnoosh Bagheri)"]	file	t	{files/M071225602468WAM.PDF}	2026-02-27 17:48:58.48	2026-02-27 20:58:16.973	\N	default_farnoosh_mashreq	\N
message796	2025-12-12 00:00:00	14:26	1225.00	AED	expense	cmm56s17a00048ogeacrpia4x	Mashreq Bank	پرداخت پول اینترنت ۳ ماه سوم به بشارOctoberNovemberDecember	["Fund transfer to Bashar Georgi Alarbaji Alsayegh (internet payment for 3 months: Oct, Nov, Dec)"]	file	t	{files/MLC0712252143297.PDF}	2026-02-27 17:48:58.48	2026-02-27 21:01:01.917	\N	default_farnoosh_mashreq	\N
message791	2025-12-06 00:00:00	23:37	1028.80	AED	expense	cmm56s17f00078oge3yf8pp6g	Tabby	\N	["Tabby Card repayment"]	image	t	{photos/photo_461@06-12-2025_23-37-00.jpg}	2026-02-27 17:48:58.48	2026-02-28 09:24:25.125	\N	default_farnoosh_mashreq	\N
message802	2025-12-12 00:00:00	14:35	100.00	AED	expense	cmm60aoac0000ry015m0ptwvq	Al Ain Food And Bevera	شارژ حساب العین	["Al Ain account top-up/charge"]	image	t	{photos/photo_468@12-12-2025_14-35-23.jpg}	2026-02-27 17:48:58.48	2026-02-28 09:27:51.077	\N	default_farnoosh_mashreq	\N
message803	2025-12-12 00:00:00	15:40	358.99	AED	expense	cmm5cqzf10001pw01d9pekwf0	Home Centre	خرید جاکفشی از home centre	["Slim 18-Pair Shoe Cabinet (341.89 + 17.10 VAT)"]	image	t	{photos/photo_469@12-12-2025_15-40-01.jpg}	2026-02-27 17:48:58.48	2026-02-28 09:27:57.329	\N	default_farnoosh_mashreq	\N
message806	2025-12-12 00:00:00	15:45	118.00	AED	expense	cmm56s17g00088oge05l6cktv	LC Waikiki	خرید لباس‌های فرنوش	Jersey T-Shirt Long-Sleeve, Underwear Pyjamas	image	t	{photos/photo_471@12-12-2025_15-45-00.jpg}	2026-02-27 17:48:58.48	2026-02-27 17:48:58.48	\N	default_farnoosh_mashreq	\N
message808	2025-12-12 00:00:00	15:48	20.48	AED	expense	cmm56s17600018ogeqghk7vfb	Carrefour	غذا در کارفور	Food at Carrefour	image	t	{photos/photo_472@12-12-2025_15-48-57.jpg}	2026-02-27 17:48:58.48	2026-02-27 17:48:58.48	\N	default_farnoosh_mashreq	\N
message809	2025-12-12 00:00:00	15:49	10.78	AED	expense	cmm56s17600018ogeqghk7vfb	Carrefour	غذا در کارفور	Food at Carrefour	image	t	{photos/photo_473@12-12-2025_15-49-18.jpg}	2026-02-27 17:48:58.48	2026-02-27 17:48:58.48	\N	default_farnoosh_mashreq	\N
message810	2025-12-12 00:00:00	15:49	54.32	AED	expense	cmm56s17800028ogefz2eqqt0	Carrefour	خرید از کارفور	Purchase from Carrefour	image	t	{photos/photo_474@12-12-2025_15-49-23.jpg}	2026-02-27 17:48:58.48	2026-02-27 17:48:58.48	\N	default_farnoosh_mashreq	\N
message811	2025-12-12 00:00:00	15:57	100.49	AED	expense	cmm56s17800028ogefz2eqqt0	Geant Express	Geant	Avocado, pancake mix, sea bass, bread, lemon, lettuce	image	t	{photos/photo_475@12-12-2025_15-57-14.jpg}	2026-02-27 17:48:58.48	2026-02-27 17:48:58.48	\N	default_farnoosh_mashreq	\N
message813	2025-12-18 00:00:00	18:12	242.00	AED	expense	cmm56s17600018ogeqghk7vfb	\N	رستوران هفت خوان۲۴۲ درهم مال ماست	\N	image	t	{photos/photo_476@18-12-2025_18-12-41.jpg}	2026-02-27 17:48:58.48	2026-02-27 17:48:58.48	\N	default_farnoosh_mashreq	\N
message814	2025-12-18 00:00:00	18:15	134.78	AED	expense	cmm56s17800028ogefz2eqqt0	Geant Express	Geant	Banana, mandarine, Pril dishwashing, farm fresh organic, protein bar, salmon, mushroom, sourdough	image	t	{photos/photo_477@18-12-2025_18-15-07.jpg}	2026-02-27 17:48:58.48	2026-02-27 17:48:58.48	\N	default_farnoosh_mashreq	\N
message804	2025-12-12 00:00:00	15:42	70.25	AED	expense	cmm56s17g00088oge05l6cktv	Landmark (Max)	خرید ست لباس خونه صورتی فرنوش	["Pink Lurex Stripe Bin 1800 (70.00)","Max Brown Paper Shopping Bag (0.25)"]	image	t	{photos/photo_470@12-12-2025_15-42-17.jpg}	2026-02-27 17:48:58.48	2026-02-28 09:28:04.394	\N	default_farnoosh_mashreq	\N
message817	2025-12-18 00:00:00	18:18	100.00	AED	expense	cmm56s17a00048ogeacrpia4x	du	اینترنت سیم کارت سینا	Sina SIM card internet recharge	image	t	{photos/photo_479@18-12-2025_18-18-07.jpg}	2026-02-27 17:48:58.48	2026-02-27 17:48:58.48	\N	default_farnoosh_mashreq	\N
message818	2025-12-18 00:00:00	18:20	24000.00	AED	income	cmm56s17000008ogezghgfclk	Mashreq ATM - Gold Centre	واریز به حساب از طریق دستگاه ATM	ATM cash deposit, 24x AED 1000 notes	image	t	{photos/photo_480@18-12-2025_18-20-58.jpg}	2026-02-27 17:48:58.48	2026-02-27 17:48:58.48	\N	default_farnoosh_mashreq	\N
message819	2025-12-18 00:00:00	18:22	186.00	AED	expense	cmm56s17600018ogeqghk7vfb	Kebab Khodmooni	کباب خودمونی	Homestyle kebab restaurant meal	image	t	{photos/photo_481@18-12-2025_18-22-54.jpg}	2026-02-27 17:48:58.48	2026-02-27 17:48:58.48	\N	default_farnoosh_mashreq	\N
message822	2025-12-18 00:00:00	18:25	198.00	AED	expense	cmm56s17800028ogefz2eqqt0	Seyed Kazem Mirjalili	سید کاظم میرجلیلی	Purchase	image	t	{photos/photo_484@18-12-2025_18-25-16.jpg}	2026-02-27 17:48:58.48	2026-02-28 09:28:40.114	\N	default_farnoosh_mashreq	\N
message821	2025-12-18 00:00:00	18:24	31.85	AED	expense	cmm56s17600018ogeqghk7vfb	Sindbad (via Talabat)	معجون از سندباد	Smoothie/juice delivery	image	t	{photos/photo_483@18-12-2025_18-24-35.jpg}	2026-02-27 17:48:58.48	2026-02-27 17:48:58.48	\N	default_farnoosh_mashreq	\N
message823	2025-12-18 00:00:00	18:26	220.24	AED	expense	cmm56s17800028ogefz2eqqt0	Geant Express	Geant	Passion fruit, lemon, blueberries, angus beef, banana, avocado, bread	image	t	{photos/photo_485@18-12-2025_18-26-13.jpg}	2026-02-27 17:48:58.48	2026-02-27 17:48:58.48	\N	default_farnoosh_mashreq	\N
message824	2025-12-18 00:00:00	18:27	40.00	AED	expense	cmm56s17900038ogeyynewip3	Dubai Airport Parking	پول پارکینگ فرودگاه	Airport parking Terminal 1	image	t	{photos/photo_486@18-12-2025_18-27-11.jpg}	2026-02-27 17:48:58.48	2026-02-27 17:48:58.48	\N	default_farnoosh_mashreq	\N
message825	2025-12-23 00:00:00	22:52	232.51	AED	expense	cmm56s17600018ogeqghk7vfb	Al Beiruti	رستوران البیروتی	Penne alfredo, chicken shawarma platter, mix grill 250g	image	t	{photos/photo_487@23-12-2025_22-52-22.jpg}	2026-02-27 17:48:58.48	2026-02-27 17:48:58.48	\N	default_farnoosh_mashreq	\N
message828	2025-12-23 00:00:00	23:01	249.59	AED	expense	cmm56s17600018ogeqghk7vfb	Eataly	رستوران eataly	Restaurant meal at Eataly	image	t	{photos/photo_490@23-12-2025_23-01-07.jpg}	2026-02-27 17:48:58.48	2026-02-27 17:48:58.48	\N	default_farnoosh_mashreq	\N
message829	2025-12-23 00:00:00	23:02	2.00	AED	expense	cmm56s17900038ogeyynewip3	RTA Dubai	پارکینگ kite beach	Kite Beach parking	image	t	{photos/photo_491@23-12-2025_23-02-08.jpg}	2026-02-27 17:48:58.48	2026-02-27 17:48:58.48	\N	default_farnoosh_mashreq	\N
message830	2025-12-23 00:00:00	23:03	25.00	AED	expense	cmm56s17600018ogeqghk7vfb	Healthy Pop Foods	سیب زمینی سیخی دم kite beach	Skewered potato at Kite Beach	image	t	{photos/photo_492@23-12-2025_23-03-11.jpg}	2026-02-27 17:48:58.48	2026-02-27 17:48:58.48	\N	default_farnoosh_mashreq	\N
message831	2025-12-23 00:00:00	23:03	314.31	AED	expense	cmm56s17800028ogefz2eqqt0	Geant Express	Geant	Tomato, banana, cucumber, mango, Barbican, angus beef, avocado, sea bass	image	t	{photos/photo_493@23-12-2025_23-03-23.jpg}	2026-02-27 17:48:58.48	2026-02-27 17:48:58.48	\N	default_farnoosh_mashreq	\N
message833	2025-12-23 00:00:00	23:07	15.00	AED	expense	cmm56s17900038ogeyynewip3	Hala Taxi	تاکسی از جیان به خونه	Taxi from Geant to home, 500m	image	t	{photos/photo_494@23-12-2025_23-07-44.jpg}	2026-02-27 17:48:58.48	2026-02-27 17:48:58.48	\N	default_farnoosh_mashreq	\N
message834	2025-12-23 00:00:00	23:08	100.00	AED	expense	cmm56s17900038ogeyynewip3	Emarat	بنزین	Fuel/gasoline	image	t	{photos/photo_495@23-12-2025_23-08-34.jpg}	2026-02-27 17:48:58.48	2026-02-27 17:48:58.48	\N	default_farnoosh_mashreq	\N
message835	2025-12-23 00:00:00	23:09	20.00	AED	expense	cmm56s17900038ogeyynewip3	Tariq Alnajah Car Park	پول پارکینگ بازار که سینا و مامان باباش رفتن	["Parking at Bazaar"]	image	t	{photos/photo_496@23-12-2025_23-09-28.jpg}	2026-02-27 17:48:58.48	2026-02-27 17:48:58.48	\N	default_farnoosh_mashreq	\N
message836	2025-12-23 00:00:00	23:10	60.00	AED	expense	cmm56s17600018ogeqghk7vfb	Jumeirah Al Naseem	سوسیس در مدینه جمیرا	["Sausage at Madinat Jumeirah"]	image	t	{photos/photo_497@23-12-2025_23-10-11.jpg}	2026-02-27 17:48:58.48	2026-02-27 17:48:58.48	\N	default_farnoosh_mashreq	\N
message837	2025-12-25 00:00:00	21:32	35.70	AED	expense	cmm56s17800028ogefz2eqqt0	\N	۳۵.۷۰ درهم از spinneysخرید کردیم24th December12:16 PM	\N	text	f	{}	2026-02-27 17:48:58.48	2026-02-27 17:48:58.48	\N	default_farnoosh_mashreq	\N
message826	2025-12-23 00:00:00	22:56	600.00	AED	expense	cmm56s17f00078oge3yf8pp6g	\N	ورودی باشگاه ایرانیان برای شب یلدا۶۰۰ درهم برای ماست۳۰۰ برای نگین اینا	\N	image	t	{photos/photo_488@23-12-2025_22-56-32.jpg}	2026-02-27 17:48:58.48	2026-02-28 09:29:10.05	\N	default_farnoosh_mashreq	\N
message827	2025-12-23 00:00:00	22:59	140.00	AED	expense	cmm56s17f00078oge3yf8pp6g	\N	ورودی باغ گل‌هابرای مامان و بابای سینا ترکیبی با باترفلای گرفتیم که نفری ۱۴۰ درهم بود	\N	image	t	{photos/photo_489@23-12-2025_22-59-58.jpg}	2026-02-27 17:48:58.48	2026-02-28 09:29:30.55	\N	default_farnoosh_mashreq	\N
cmm6fdwd3000o8o1s1lqoin7v	2025-04-11 00:00:00	08:48	5.80	AED	expense	cmm56s17800028ogefz2eqqt0	Spinneys	سینا ۵.۸۰ درهم از Spinneys نون خرید کرده رسیدشو نگرفته	\N	\N	f	{}	2026-02-28 14:37:41.272	2026-02-28 14:37:41.272	\N	cmm6fbnk800008o9w89ze2ol6	\N
message838	2025-12-25 00:00:00	21:33	80.00	AED	expense	cmm56s17900038ogeyynewip3	Parkonic - The Beach JBR	پول پارکینگ JBR	["Parking at JBR (4 hours)"]	image	t	{photos/photo_498@25-12-2025_21-33-35.jpg}	2026-02-27 17:48:58.48	2026-02-27 17:48:58.48	\N	default_farnoosh_mashreq	\N
message847	2025-12-25 00:00:00	22:52	40.01	AED	expense	cmm5cqzf10001pw01d9pekwf0	Flormar	رژ لب و لاک مامان سینا	["Dewy lip glaze (AED 28.50)","Pearly nail enamel PL390 Stylish (AED 11.26)","NBP Global small craft bag (AED 0.25)"]	image	t	{photos/photo_503@25-12-2025_22-52-36.jpg}	2026-02-27 17:48:58.48	2026-02-28 09:30:00.179	\N	default_farnoosh_mashreq	\N
message853	2025-12-25 00:00:00	22:57	111.96	AED	expense	cmm5cqzf10001pw01d9pekwf0	Chemist Warehouse	خرید رژ لب‌های سوغاتی برای خاله‌ها	["Armaf T/Matt T/PF Liq L/STK 01 x2 (AED 55.98)","Armaf T/Matt T/PF Liq L/STK 06 (AED 27.99)","Armaf T/Matt T/PF Liq L/STK 03 (AED 27.99)"]	image	t	{photos/photo_507@25-12-2025_22-57-52.jpg}	2026-02-27 17:48:58.48	2026-02-28 09:30:12.614	\N	default_farnoosh_mashreq	\N
message841	2025-12-25 00:00:00	22:21	58.70	AED	expense	cmm56s17f00078oge3yf8pp6g	Platinumlist	بلیت ورودی نفر چهارم قاب دبیDubai Frame	["Dubai Frame entry ticket (4th person)"]	image	t	{photos/photo_499@25-12-2025_22-21-01.jpg}	2026-02-27 17:48:58.48	2026-02-27 17:48:58.48	\N	default_farnoosh_mashreq	\N
message842	2025-12-25 00:00:00	22:46	10.50	AED	expense	cmm56s17900038ogeyynewip3	Mohammad Ishaq Car Park	پول پارکینگ قاب دبی Dubai Frame	["Parking at Dubai Frame"]	image	t	{photos/photo_500@25-12-2025_22-46-28.jpg}	2026-02-27 17:48:58.48	2026-02-27 17:48:58.48	\N	default_farnoosh_mashreq	\N
message843	2025-12-25 00:00:00	22:46	157.00	AED	expense	cmm56s17g00088oge05l6cktv	LC Waikiki	LC Waikiki۶۹ درهمش شلوار بابای فرنوشه	["Underwear pyjamas (AED 39.00)","Woven blouse shirt long-sleeved (AED 49.00)","Underwear key pyjamas (AED 69.00)"]	image	t	{photos/photo_501@25-12-2025_22-46-56.jpg}	2026-02-27 17:48:58.48	2026-02-27 17:48:58.48	\N	default_farnoosh_mashreq	\N
message845	2025-12-25 00:00:00	22:51	40.00	AED	expense	cmm56s17g00088oge05l6cktv	Max (Landmark Retail)	کادوی بابای سینا به فرنوش	["Snake print sleeveless top"]	image	t	{photos/photo_502@25-12-2025_22-51-11.jpg}	2026-02-27 17:48:58.48	2026-02-27 17:48:58.48	\N	default_farnoosh_mashreq	\N
message849	2025-12-25 00:00:00	22:53	23.37	AED	expense	cmm56s17600018ogeqghk7vfb	Carrefour City	غذا در کارفور	["Food at Carrefour"]	image	t	{photos/photo_504@25-12-2025_22-53-42.jpg}	2026-02-27 17:48:58.48	2026-02-27 17:48:58.48	\N	default_farnoosh_mashreq	\N
message850	2025-12-25 00:00:00	22:53	36.21	AED	expense	cmm56s17600018ogeqghk7vfb	Carrefour City	غذا در کارفور	["Food at Carrefour"]	image	t	{photos/photo_505@25-12-2025_22-53-59.jpg}	2026-02-27 17:48:58.48	2026-02-27 17:48:58.48	\N	default_farnoosh_mashreq	\N
message851	2025-12-25 00:00:00	22:54	118.94	AED	expense	cmm56s17800028ogefz2eqqt0	Carrefour Al Ghurair	خرید سوغاتی از کارفور	["Toffifee 200g x9 (AED 9.99 each)","Alm feta lite 200g (AED 6.29)","Twix minis 200g x2 (AED 22.49)","Plastic shopping bag (AED 0.25)"]	image	t	{photos/photo_506@25-12-2025_22-54-34.jpg}	2026-02-27 17:48:58.48	2026-02-27 17:48:58.48	\N	default_farnoosh_mashreq	\N
message856	2025-12-25 00:00:00	23:00	54.00	AED	expense	cmm56s17600018ogeqghk7vfb	Cold Stone Creamery	خرید بستنی	["Ice cream"]	image	t	{photos/photo_509@25-12-2025_23-00-07.jpg}	2026-02-27 17:48:58.48	2026-02-27 17:48:58.48	\N	default_farnoosh_mashreq	\N
message859	2025-12-25 00:00:00	23:01	30.00	AED	expense	cmm56s17900038ogeyynewip3	Public Parking (Al Ghurair)	پول پارکینگ پاساژ الغریر	["Parking at Al Ghurair Passage"]	image	t	{photos/photo_511@25-12-2025_23-01-37.jpg}	2026-02-27 17:48:58.48	2026-02-27 17:48:58.48	\N	default_farnoosh_mashreq	\N
message866	2025-12-25 00:00:00	23:25	47.25	AED	expense	cmm56s17f00078oge3yf8pp6g	Platinumlist (via Tabby)	۴۷.۲۵ درهم قسط دوم تبی برای بلیت قاب دبیکلش ۱۴۱.۷۶ درهم شد	["Tabby installment 2 of 3 for Dubai Frame ticket (total AED 141.76)"]	image	t	{photos/photo_517@25-12-2025_23-25-02.jpg}	2026-02-27 17:48:58.48	2026-02-27 17:48:58.48	\N	default_farnoosh_mashreq	\N
message867	2025-12-26 00:00:00	14:42	89.00	AED	expense	cmm56s17g00088oge05l6cktv	LC Waikiki (Mirdif City Centre)	خرید لباس مامان سینا از LCW	["Cardigan coat active sport"]	image	t	{photos/photo_518@26-12-2025_14-42-56.jpg}	2026-02-27 17:48:58.48	2026-02-27 17:48:58.48	\N	default_farnoosh_mashreq	\N
message869	2025-12-26 00:00:00	14:43	75.00	AED	expense	cmm56s17g00088oge05l6cktv	Max (Landmark Retail Investment Co. LLC)	خرید لباس مامان سینا از max	["Suede Utility Shirt"]	image	t	{photos/photo_519@26-12-2025_14-43-36.jpg}	2026-02-27 17:48:58.48	2026-02-27 17:48:58.48	\N	default_farnoosh_mashreq	\N
message871	2026-01-02 00:00:00	00:24	121.20	AED	expense	cmm56s17f00078oge3yf8pp6g	Platinumlist	بلیت دهکده جهانی برای ۴ تامونGlobal Village	["Global Village tickets x4"]	image	t	{photos/photo_520@02-01-2026_00-24-31.jpg}	2026-02-27 17:48:58.48	2026-02-27 17:48:58.48	\N	default_farnoosh_mashreq	\N
message855	2025-12-25 00:00:00	22:59	104.25	AED	expense	cmm5cqzf10001pw01d9pekwf0	Lril	خرید کت سوغاتی خاله	["Souvenir book for aunt"]	image	t	{photos/photo_508@25-12-2025_22-59-12.jpg}	2026-02-27 17:48:58.48	2026-02-28 09:30:18.188	\N	default_farnoosh_mashreq	\N
message857	2025-12-25 00:00:00	23:00	56.30	AED	expense	cmm5cqzf10001pw01d9pekwf0	Life Pharmacy	سوغاتی برای عمه‌ها و خاله	["EV Revitalum repairing file n cream heels (AED 14.18)","EV Hyaluronic acid & green tea moisturizer 50ml (AED 19.68)","EV Green olive anti-wrinkle day/night cream 50ml (AED 22.05)","White paper bag (AED 0.39)"]	image	t	{photos/photo_510@25-12-2025_23-00-43.jpg}	2026-02-27 17:48:58.48	2026-02-28 09:30:25.961	\N	default_farnoosh_mashreq	\N
message861	2025-12-25 00:00:00	23:03	1226.75	AED	expense	cmm5cqzf10001pw01d9pekwf0	Amazon.ae (via Tabby)	قسط اول گوشی فرنوش با تبی - Tabby	["Tabby installment 1 of 4 for phone (Farnoosh) - total AED 4907.00"] | ["Tabby payment 1 of 4 for Amazon.ae order (total AED 4907.00)"]	image	t	{photos/photo_513@25-12-2025_23-03-15.jpg,photos/photo_512@25-12-2025_23-03-15.jpg}	2026-02-27 17:48:58.48	2026-02-28 09:31:00.04	\N	default_farnoosh_mashreq	\N
message864	2025-12-25 00:00:00	23:15	224.25	AED	expense	cmm5cqzf10001pw01d9pekwf0	Paymob (via Tabby)	\N	["Tabby installment 1 of 4 for Paymob purchase (total AED 897.00)"]	image	t	{photos/photo_515@25-12-2025_23-15-54.jpg}	2026-02-27 17:48:58.48	2026-02-28 09:32:09.083	\N	default_farnoosh_mashreq	\N
message865	2025-12-25 00:00:00	23:15	141.56	AED	expense	cmm5cqzf10001pw01d9pekwf0	Aster Opticals (via Tabby)	\N	["Tabby installment 3 of 4 for sunglasses (total AED 566.25)"]	image	t	{photos/photo_516@25-12-2025_23-15-54.jpg}	2026-02-27 17:48:58.48	2026-02-28 09:33:02.682	\N	default_farnoosh_mashreq	\N
message863	2025-12-25 00:00:00	23:15	0.00	AED	expense	cmm5cqzf10001pw01d9pekwf0	Tabby	قسط تبی - Tabby۲۲۴.۲۵ بابت قسط اول کشتی لوتوس۱۴۱.۵۶ عینک آفتابی سینا	["Tabby installment payment - AED 224.25 for Paymob (phone installment from AED 897.00)","Tabby installment payment - AED 141.56 for Aster Opticals sunglasses (from AED 566.25)"]	image	t	{photos/photo_514@25-12-2025_23-15-54.jpg}	2026-02-27 17:48:58.48	2026-02-28 09:33:26.335	\N	default_farnoosh_mashreq	\N
cmm6fdwd4000q8o1s3lpqj1yx	2025-04-11 00:00:00	20:35	24.70	AED	expense	cmm56s17800028ogefz2eqqt0	Choithram	سینا ۲۴.۷۰ درهم از Choithram بستنی خرید کرده رسیدشو نگرفته	\N	\N	f	{}	2026-02-28 14:37:41.272	2026-02-28 14:37:41.272	\N	cmm6fbnk800008o9w89ze2ol6	\N
message872	2026-01-02 00:00:00	00:26	200.00	AED	expense	cmm56s17900038ogeyynewip3	Salik	شارژ حساب سالیک	["Salik account recharge"]	image	t	{photos/photo_521@02-01-2026_00-26-12.jpg}	2026-02-27 17:48:58.48	2026-02-27 17:48:58.48	\N	default_farnoosh_mashreq	\N
message875	2026-01-02 00:00:00	00:30	25.00	AED	expense	cmm56s17600018ogeqghk7vfb	Noqodi Gv Ira (Global Village)	خوراکی در Global Village	["Food at Global Village"]	image	t	{photos/photo_522@02-01-2026_00-30-24.jpg}	2026-02-27 17:48:58.48	2026-02-27 17:48:58.48	\N	default_farnoosh_mashreq	\N
message876	2026-01-02 00:00:00	00:30	30.00	AED	expense	cmm56s17600018ogeqghk7vfb	Noqodi Gv Tur (Global Village)	خوراکی در Global Village	["Food at Global Village"]	image	t	{photos/photo_523@02-01-2026_00-30-42.jpg}	2026-02-27 17:48:58.48	2026-02-27 17:48:58.48	\N	default_farnoosh_mashreq	\N
message877	2026-01-02 00:00:00	00:30	20.00	AED	expense	cmm56s17600018ogeqghk7vfb	Noqodi Gv Tur (Global Village)	خوراکی در Global Village	["Food at Global Village"]	image	t	{photos/photo_524@02-01-2026_00-30-46.jpg}	2026-02-27 17:48:58.48	2026-02-27 17:48:58.48	\N	default_farnoosh_mashreq	\N
message878	2026-01-02 00:00:00	00:32	36.50	AED	expense	cmm56s17800028ogefz2eqqt0	Urban Fresh Mini Mart Co. LLC	خرید از سوپرمارکت پایین خونه	["Supermarket purchase"]	image	t	{photos/photo_525@02-01-2026_00-32-05.jpg}	2026-02-27 17:48:58.48	2026-02-27 17:48:58.48	\N	default_farnoosh_mashreq	\N
message879	2026-01-02 00:00:00	00:32	220.83	AED	expense	cmm56s17800028ogefz2eqqt0	Geant (GMG)	Geant	["American Garden","Banana Chiquita","Nectarine White","Apple Green Serb","Potato Lebanon","Lettuce Romaine","Capsicum Green","EBF Organic Sage","Kitco Nice Chips","Fresh Chicken","Red Currant","Clementine","DAC Toilet Rim","EBF Organic Cucumber","Heinz Tomato Paste","Tomato Round GCC","Onion Red India"]	image	t	{photos/photo_526@02-01-2026_00-32-15.jpg}	2026-02-27 17:48:58.48	2026-02-27 17:48:58.48	\N	default_farnoosh_mashreq	\N
message881	2026-01-02 00:00:00	00:33	68.20	AED	expense	cmm56s17800028ogefz2eqqt0	Geant (Gmg Consumer Llc)	Geant	["Groceries"]	image	t	{photos/photo_527@02-01-2026_00-33-13.jpg}	2026-02-27 17:48:58.48	2026-02-27 17:48:58.48	\N	default_farnoosh_mashreq	\N
message882	2026-01-02 00:00:00	00:33	288.75	AED	expense	cmm56s17600018ogeqghk7vfb	Kebab Khodmooni Restaurant	کباب خودمونی	["Homemade kebab"]	image	t	{photos/photo_528@02-01-2026_00-33-41.jpg}	2026-02-27 17:48:58.48	2026-02-27 17:48:58.48	\N	default_farnoosh_mashreq	\N
message883	2026-01-02 00:00:00	00:34	40.00	AED	expense	cmm56s17900038ogeyynewip3	Mawgif	پول پارکینگ فرودگاه	["Airport parking"]	image	t	{photos/photo_529@02-01-2026_00-34-05.jpg}	2026-02-27 17:48:58.553	2026-02-27 17:48:58.553	\N	default_farnoosh_mashreq	\N
message884	2026-01-02 00:00:00	00:34	45.00	AED	expense	cmm56s17800028ogefz2eqqt0	Spinneys Sobha Hartland	Spinneys	["Groceries"]	image	t	{photos/photo_530@02-01-2026_00-34-33.jpg}	2026-02-27 17:48:58.553	2026-02-27 17:48:58.553	\N	default_farnoosh_mashreq	\N
message885	2026-01-02 00:00:00	00:35	237.10	AED	expense	cmm56s17600018ogeqghk7vfb	Roasters Coffee House	صبحانه در کافی شاپ محلمون Roasters	["Breakfast at Roasters coffee shop"]	image	t	{photos/photo_531@02-01-2026_00-35-16.jpg}	2026-02-27 17:48:58.553	2026-02-27 17:48:58.553	\N	default_farnoosh_mashreq	\N
message886	2026-01-02 00:00:00	00:35	1000.00	AED	transfer	cmm56s17i00098oge2xb5or4t	Mashreq Bank	کارت به کارت از فرنوش به سینا	["Fund transfer from Farnoosh Bagheri to Sina Ghadri"]	file	t	{files/MWM3112252034189.PDF}	2026-02-27 17:48:58.553	2026-02-27 17:48:58.553	\N	default_farnoosh_mashreq	\N
message887	2026-01-02 00:00:00	00:36	109.70	AED	expense	cmm56s17600018ogeqghk7vfb	The Coop House	پاستا و نان سیر کافی شاپ محلمونThe Coop House	["Pasta and garlic bread"]	image	t	{photos/photo_532@02-01-2026_00-36-58.jpg}	2026-02-27 17:48:58.553	2026-02-27 17:48:58.553	\N	default_farnoosh_mashreq	\N
message888	2026-01-02 00:00:00	00:37	81.33	AED	expense	cmm56s17800028ogefz2eqqt0	Geant (Gmg Consumer Llc)	Geant	["Groceries"]	image	t	{photos/photo_533@02-01-2026_00-37-29.jpg}	2026-02-27 17:48:58.553	2026-02-27 17:48:58.553	\N	default_farnoosh_mashreq	\N
message889	2026-01-02 00:00:00	00:37	75.00	AED	expense	cmm5cqzf10001pw01d9pekwf0	Danube Phone	بابت گلس گوشی	["Phone screen protector"]	image	t	{photos/photo_534@02-01-2026_00-37-51.jpg}	2026-02-27 17:48:58.553	2026-02-28 09:34:17.405	\N	default_farnoosh_mashreq	\N
message899	2026-01-08 00:00:00	16:04	158.77	AED	expense	cmm56s17800028ogefz2eqqt0	Geant (Gmg Consumer Llc)	Geant	["Groceries"]	image	t	{photos/photo_540@08-01-2026_16-04-25.jpg}	2026-02-27 17:48:58.553	2026-02-27 17:48:58.553	\N	default_farnoosh_mashreq	\N
message892	2026-01-02 00:00:00	00:40	43.49	AED	expense	cmm5cqzf10001pw01d9pekwf0	Amazon.ae	قابل گوشی از آمازون	["JETech Case for iPhone 17 Pro Max 6.9-Inch"]	file	t	{"files/Order Details (2).pdf"}	2026-02-27 17:48:58.553	2026-02-28 09:34:51.442	\N	default_farnoosh_mashreq	\N
message898	2026-01-08 00:00:00	16:03	5000.00	AED	income	cmm56s17i00098oge2xb5or4t	Mashreq Bank	کارت به کارت از حساب شرکت به حساب فرنوش	["Fund transfer from Farnoosh Bagheri Project Management to Farnoosh Bagheri personal account"]	file	t	{files/M05012655366WAM.PDF}	2026-02-27 17:48:58.553	2026-02-27 20:58:06.977	\N	default_farnoosh_mashreq	\N
message897	2026-01-08 00:00:00	16:03	18750.00	AED	expense	cmm56s17e00068ogeybi889nb	\N	۱۸,۷۵۰ درهم چهارمین چک خونه پاس شده5th January 2026 09:17 AM	\N	text	f	{}	2026-02-27 17:48:58.553	2026-02-28 09:38:12.413	\N	default_farnoosh_mashreq	\N
message896	2026-01-08 00:00:00	16:01	104.47	AED	expense	cmm56s17900038ogeyynewip3	Emarat	بنزین	["Now Omega 3 1000mg Fish Oil Softgels Pack of 100's","Alive Men's Multivitamin Gummies With Orchard Fruits & Garden Veggies Pack of 60's"]	image	t	{photos/photo_539@08-01-2026_16-01-51.jpg}	2026-02-27 17:48:58.553	2026-02-28 09:46:37.182	\N	default_farnoosh_mashreq	\N
message893	2026-01-08 00:00:00	15:56	137.55	AED	expense	cmm56s17j000a8ogezifv1oi1	Aster	کادوی روز مرد سینا	["Man's day gift for Sina"]	image	t	{photos/photo_536@08-01-2026_15-56-20.jpg}	2026-02-27 17:48:58.553	2026-02-28 09:46:25.855	\N	default_farnoosh_mashreq	\N
message895	2026-01-08 00:00:00	16:01	182.00	AED	expense	cmm56s17600018ogeqghk7vfb	Rivas Restaurant	ریواس	["Gasoline (petrol)"]	image	t	{photos/photo_538@08-01-2026_16-01-38.jpg}	2026-02-27 17:48:58.553	2026-02-28 09:46:31.003	\N	default_farnoosh_mashreq	\N
message894	2026-01-08 00:00:00	16:01	15.00	AED	expense	cmm56s17600018ogeqghk7vfb	La Fragola	بستنی در بازارچه برج خلیفه	["Ice cream / food at Burj Khalifa bazaar"]	image	t	{photos/photo_537@08-01-2026_16-01-25.jpg}	2026-02-27 17:48:58.553	2026-02-28 09:46:47.244	\N	default_farnoosh_mashreq	\N
cmm6fdwcq000a8o1sux7lhw5y	2025-03-27 00:00:00	22:42	100.00	AED	expense	cmm56s17i00098oge2xb5or4t	\N	۱۰۰ درهم بابت BFINITY BITFI TECHNOLO\nاز حساب کم شد	\N	\N	f	{}	2026-02-28 14:37:41.259	2026-02-28 15:16:44.023	\N	cmm6fbnk800008o9w89ze2ol6	\N
message909	2026-01-18 00:00:00	14:46	19.50	AED	expense	cmm56s17j000a8ogezifv1oi1	\N	۱۹.۵۰ درهم داروخانه Life پماد گل‌مژه خریدم12th January 08:50 PM	\N	text	f	{}	2026-02-27 17:48:58.553	2026-02-28 09:50:35.842	\N	default_farnoosh_mashreq	\N
message904	2026-01-16 00:00:00	16:13	156.78	AED	expense	cmm56s17600018ogeqghk7vfb	\N	۱۵۶.۷۸ درهم رستوران هفت خان09th January 02:58 PM	\N	text	f	{}	2026-02-27 17:48:58.553	2026-02-27 17:48:58.553	\N	default_farnoosh_mashreq	\N
message905	2026-01-16 00:00:00	16:20	370.00	AED	expense	cmm56s17600018ogeqghk7vfb	\N	۳۷۰ درهم کباب خودمونی۱۹۵ درهمش مال ماست09th January 10:51 PM	\N	text	f	{}	2026-02-27 17:48:58.553	2026-02-27 17:48:58.553	\N	default_farnoosh_mashreq	\N
message906	2026-01-18 00:00:00	11:01	77.00	AED	expense	cmm56s17600018ogeqghk7vfb	\N	۷۷ درهم کافه محلمون  کنافه و نوشیدنی خوردیمPalma Cafe11th January 02:03 PM	\N	text	f	{}	2026-02-27 17:48:58.553	2026-02-27 17:48:58.553	\N	default_farnoosh_mashreq	\N
message907	2026-01-18 00:00:00	14:37	6.00	AED	expense	cmm56s17900038ogeyynewip3	RTA Dubai Parking	پارکینگ	["Parking 1 hour"]	image	t	{photos/photo_544@18-01-2026_14-37-43.jpg}	2026-02-27 17:48:58.553	2026-02-27 17:48:58.553	\N	default_farnoosh_mashreq	\N
message908	2026-01-18 00:00:00	14:37	6.00	AED	expense	cmm56s17900038ogeyynewip3	RTA Dubai Parking	پارکینگ	["Parking 1 hour"]	image	t	{photos/photo_545@18-01-2026_14-37-58.jpg}	2026-02-27 17:48:58.553	2026-02-27 17:48:58.553	\N	default_farnoosh_mashreq	\N
message912	2026-01-18 00:00:00	14:51	70.00	AED	expense	cmm56s17a00048ogeacrpia4x	\N	۷۰ درهم اینترنت du سینا13th January 12:43 PM	\N	text	f	{}	2026-02-27 17:48:58.553	2026-02-27 17:48:58.553	\N	default_farnoosh_mashreq	\N
message915	2026-01-18 00:00:00	15:28	184.00	AED	expense	cmm56s17j000a8ogezifv1oi1	\N	۱۸۴ درهم ویزیت متخصص چشم بیمارستان ایرانیان14th January 12:26 PM	\N	text	f	{}	2026-02-27 17:48:58.553	2026-02-27 17:48:58.553	\N	default_farnoosh_mashreq	\N
message917	2026-01-18 00:00:00	15:30	224.71	AED	expense	cmm56s17e00068ogeybi889nb	Al Ameen Al Aqaree Llc	تمدید اجاره خونه	["Rent renewal"]	image	t	{photos/photo_547@18-01-2026_15-30-02.jpg}	2026-02-27 17:48:58.553	2026-02-27 17:48:58.553	\N	default_farnoosh_mashreq	\N
message918	2026-01-18 00:00:00	15:32	169.35	AED	expense	cmm56s17800028ogefz2eqqt0	Day To Day	Day to dayدی‌ تو دی	\N	image	t	{photos/photo_548@18-01-2026_15-32-20.jpg}	2026-02-27 17:48:58.553	2026-02-27 17:48:58.553	\N	default_farnoosh_mashreq	\N
message919	2026-01-18 00:00:00	15:33	85.25	AED	expense	cmm56s17600018ogeqghk7vfb	Subway Jumeirah 2	Subway	\N	image	t	{photos/photo_549@18-01-2026_15-33-38.jpg}	2026-02-27 17:48:58.553	2026-02-27 17:48:58.553	\N	default_farnoosh_mashreq	\N
message920	2026-01-18 00:00:00	15:33	2.00	AED	expense	cmm56s17900038ogeyynewip3	RTA Dubai	پارکینگ	["Parking"]	image	t	{photos/photo_550@18-01-2026_15-33-46.jpg}	2026-02-27 17:48:58.553	2026-02-27 17:48:58.553	\N	default_farnoosh_mashreq	\N
message922	2026-01-18 00:00:00	15:53	65.62	AED	expense	cmm56s17g00088oge05l6cktv	LC Waikiki Ibn Battuta Mall	\N	["Tabby installment 2 of 4 - total purchase 262.50"]	image	t	{photos/photo_552@18-01-2026_15-53-48.jpg}	2026-02-27 17:48:58.553	2026-02-27 17:48:58.553	\N	default_farnoosh_mashreq	\N
message923	2026-01-18 00:00:00	15:53	59.75	AED	expense	cmm56s17g00088oge05l6cktv	Skechers Ibn Battuta Mall	\N	["Tabby installment 2 of 4 - total purchase 239.00"]	image	t	{photos/photo_553@18-01-2026_15-53-48.jpg}	2026-02-27 17:48:58.553	2026-02-27 17:48:58.553	\N	default_farnoosh_mashreq	\N
message924	2026-01-18 00:00:00	15:56	56.55	AED	expense	cmm56s17800028ogefz2eqqt0	Choithrams	CHOITHRAMS	\N	image	t	{photos/photo_554@18-01-2026_15-56-30.jpg}	2026-02-27 17:48:58.553	2026-02-27 17:48:58.553	\N	default_farnoosh_mashreq	\N
message925	2026-01-18 00:00:00	15:56	15.70	AED	expense	cmm56s17800028ogefz2eqqt0	Geant (Gmg Consumer Llc)	Geant	\N	image	t	{photos/photo_555@18-01-2026_15-56-55.jpg}	2026-02-27 17:48:58.553	2026-02-27 17:48:58.553	\N	default_farnoosh_mashreq	\N
message927	2026-01-18 00:00:00	15:57	6.00	AED	expense	cmm56s17900038ogeyynewip3	RTA Dubai Parking	پارکینگ	["Parking 1 hour"]	image	t	{photos/photo_557@18-01-2026_15-57-23.jpg}	2026-02-27 17:48:58.553	2026-02-27 17:48:58.553	\N	default_farnoosh_mashreq	\N
message928	2026-01-18 00:00:00	15:58	6.00	AED	expense	cmm56s17900038ogeyynewip3	RTA Dubai	پارکینگ	["Parking"]	image	t	{photos/photo_558@18-01-2026_15-58-00.jpg}	2026-02-27 17:48:58.553	2026-02-27 17:48:58.553	\N	default_farnoosh_mashreq	\N
message929	2026-01-18 00:00:00	16:01	2000.00	AED	income	cmm56s17000008ogezghgfclk	Mashreq ATM	واریز به حساب از طریق ATM	["Cash deposit via ATM - Farnoosh Bagheri"]	image	t	{photos/photo_559@18-01-2026_16-01-50.jpg}	2026-02-27 17:48:58.553	2026-02-27 17:48:58.553	\N	default_farnoosh_mashreq	\N
message930	2026-01-18 00:00:00	16:02	49.00	AED	expense	cmm56s17600018ogeqghk7vfb	Subway	Subway	\N	image	t	{photos/photo_560@18-01-2026_16-02-33.jpg}	2026-02-27 17:48:58.553	2026-02-27 17:48:58.553	\N	default_farnoosh_mashreq	\N
message931	2026-01-18 00:00:00	16:02	79.20	AED	expense	cmm56s17600018ogeqghk7vfb	Sultan Baba Iskender	بابا اسکندر۴۵ تاش برای حامد بود	\N	image	t	{photos/photo_561@18-01-2026_16-02-53.jpg}	2026-02-27 17:48:58.553	2026-02-27 17:48:58.553	\N	default_farnoosh_mashreq	\N
message910	2026-01-18 00:00:00	14:49	230.94	AED	expense	cmm56s17800028ogefz2eqqt0	\N	۲۳۰.۹۴ درهم Geant13th January 11:48 AM	\N	text	f	{}	2026-02-27 17:48:58.553	2026-02-28 09:50:53.117	\N	default_farnoosh_mashreq	\N
message911	2026-01-18 00:00:00	14:50	81.45	AED	expense	cmm56s17800028ogefz2eqqt0	\N	۸۱.۴۵ درهم Choithrams13th January 12:08 PM	\N	text	f	{}	2026-02-27 17:48:58.553	2026-02-28 09:51:03.009	\N	default_farnoosh_mashreq	\N
message913	2026-01-18 00:00:00	14:52	27.00	AED	expense	cmm56s17j000a8ogezifv1oi1	\N	۲۷ درهم داروخانه aster ساشه پانادول خریدم13th January 12:52 PM	\N	text	f	{}	2026-02-27 17:48:58.553	2026-02-28 09:53:38.136	\N	default_farnoosh_mashreq	\N
message914	2026-01-18 00:00:00	15:21	132.04	AED	expense	cmm5cqzf10001pw01d9pekwf0	Tamara	قسط دوم تامارا برای خرید از آمازون	["Tamara installment 2 of 4 for Amazon purchase"]	image	t	{photos/photo_546@18-01-2026_15-21-59.jpg}	2026-02-27 17:48:58.553	2026-02-28 09:55:25.251	\N	default_farnoosh_mashreq	\N
message916	2026-01-18 00:00:00	15:28	19.50	AED	expense	cmm56s17j000a8ogezifv1oi1	\N	۱۹.۵۰ درهم قطره چشم14th January 12:39 PM	\N	text	f	{}	2026-02-27 17:48:58.553	2026-02-28 09:55:42.197	\N	default_farnoosh_mashreq	\N
message921	2026-01-18 00:00:00	15:53	125.37	AED	expense	cmm5cqzf10001pw01d9pekwf0	Tabby	قسط‌های تبی خریدهای مامان	["Tabby card repayment - installment for purchases"]	image	t	{photos/photo_551@18-01-2026_15-53-48.jpg}	2026-02-27 17:48:58.553	2026-02-28 09:56:01.707	\N	default_farnoosh_mashreq	\N
message926	2026-01-18 00:00:00	15:57	120.75	AED	expense	cmm56s17j000a8ogezifv1oi1	717 Gents Salon	کوتاهی مو سینا	["Haircut - Sina"]	image	t	{photos/photo_556@18-01-2026_15-57-05.jpg}	2026-02-27 17:48:58.553	2026-02-28 09:56:37.346	\N	default_farnoosh_mashreq	\N
message936	2026-01-18 00:00:00	16:07	158.41	AED	expense	cmm5cqzf10001pw01d9pekwf0	Tamara	قسط سوم تامارا بابت خرید از آمازون برای لوازم خونه+قسط سوم‌ تامارا بابت خرید جای سیب زمینی و پیاز از homebox	["Tamara installment 3 of 4 for Amazon home supplies + Tamara installment 3 for Homebox potato/onion storage"]	image	t	{photos/photo_563@18-01-2026_16-07-00.jpg}	2026-02-27 17:48:58.553	2026-02-28 09:58:05.773	\N	default_farnoosh_mashreq	\N
cmm6fdwd7000w8o1ssnn6y0dw	2025-04-17 00:00:00	18:24	1972.63	AED	transfer	cmm56s17i00098oge2xb5or4t	\N	1972.63 درهم از دانشگاه به حساب سینا واریز شده	\N	\N	f	{}	2026-02-28 14:37:41.275	2026-02-28 15:30:22.588	\N	cmm6fbnk800008o9w89ze2ol6	\N
message938	2026-01-18 00:00:00	16:07	22.50	AED	expense	cmm56s17800028ogefz2eqqt0	Tamara (Homebox)	\N	["Tamara installment 3 of 4 - total order 90.00 for potato and onion storage from Homebox"]	image	t	{photos/photo_565@18-01-2026_16-07-00.jpg}	2026-02-27 17:48:58.553	2026-02-27 17:48:58.553	\N	default_farnoosh_mashreq	\N
message939	2026-01-19 00:00:00	10:37	50.00	AED	expense	cmm56s17a00048ogeacrpia4x	du	شارژ du حساب فرنوش	["Mobile recharge (Farnoosh account)"]	image	t	{photos/photo_566@19-01-2026_10-37-03.jpg}	2026-02-27 17:48:58.553	2026-02-27 17:48:58.553	\N	default_farnoosh_mashreq	\N
message943	2026-01-20 00:00:00	11:10	184.00	AED	expense	cmm56s17j000a8ogezifv1oi1	Red Crescent Iranian	ویزیت متخصص چشم	["Eye specialist visit"]	image	t	{photos/photo_567@20-01-2026_11-10-13.jpg}	2026-02-27 17:48:58.553	2026-02-27 17:48:58.553	\N	default_farnoosh_mashreq	\N
message944	2026-01-20 00:00:00	11:10	111.00	AED	expense	cmm56s17j000a8ogezifv1oi1	Marina Pharmacy | Care 3	داروهای جدید چشمآنتی‌بیوتیک و قطره	["Eye medications - antibiotic and drops"]	image	t	{photos/photo_568@20-01-2026_11-10-26.jpg}	2026-02-27 17:48:58.553	2026-02-27 17:48:58.553	\N	default_farnoosh_mashreq	\N
message945	2026-01-20 00:00:00	11:29	2.00	AED	expense	cmm56s17900038ogeyynewip3	RTA Dubai	پارکینگ	["Parking"]	image	t	{photos/photo_569@20-01-2026_11-29-06.jpg}	2026-02-27 17:48:58.553	2026-02-27 17:48:58.553	\N	default_farnoosh_mashreq	\N
message946	2026-01-20 00:00:00	11:29	82.25	AED	expense	cmm56s17600018ogeqghk7vfb	Subway Jumeirah 2	Subway	["Subway meal"]	image	t	{photos/photo_570@20-01-2026_11-29-14.jpg}	2026-02-27 17:48:58.553	2026-02-27 17:48:58.553	\N	default_farnoosh_mashreq	\N
message947	2026-01-20 00:00:00	11:29	2.00	AED	expense	cmm56s17900038ogeyynewip3	RTA Dubai	پارکینگ	["Parking"]	image	t	{photos/photo_571@20-01-2026_11-29-33.jpg}	2026-02-27 17:48:58.553	2026-02-27 17:48:58.553	\N	default_farnoosh_mashreq	\N
message949	2026-01-21 00:00:00	11:40	137.65	AED	expense	cmm56s17800028ogefz2eqqt0	Choithrams	CHOITHRAMS	["Groceries"]	image	t	{photos/photo_573@21-01-2026_11-40-15.jpg}	2026-02-27 17:48:58.553	2026-02-27 17:48:58.553	\N	default_farnoosh_mashreq	\N
message950	2026-01-21 00:00:00	11:40	17.75	AED	expense	cmm56s17800028ogefz2eqqt0	Geant (Gmg Consumer Llc)	Geant	["Groceries"]	image	t	{photos/photo_574@21-01-2026_11-40-20.jpg}	2026-02-27 17:48:58.553	2026-02-27 17:48:58.553	\N	default_farnoosh_mashreq	\N
message951	2026-01-26 00:00:00	19:46	2.00	AED	expense	cmm56s17900038ogeyynewip3	RTA Dubai	پارکینگ	["Parking"]	image	t	{photos/photo_575@26-01-2026_19-46-49.jpg}	2026-02-27 17:48:58.553	2026-02-27 17:48:58.553	\N	default_farnoosh_mashreq	\N
message953	2026-01-26 00:00:00	19:54	95.00	AED	expense	cmm56s17900038ogeyynewip3	\N	۹۵ درهم پول بنزین دادیم22th January05:32 PM	\N	text	f	{}	2026-02-27 17:48:58.553	2026-02-27 17:48:58.553	\N	default_farnoosh_mashreq	\N
message954	2026-01-26 00:00:00	19:54	165.00	AED	expense	cmm56s17600018ogeqghk7vfb	Rivas Restaurant	ریواس	["Restaurant meal"]	image	t	{photos/photo_576@26-01-2026_19-54-34.jpg}	2026-02-27 17:48:58.553	2026-02-27 17:48:58.553	\N	default_farnoosh_mashreq	\N
message948	2026-01-20 00:00:00	11:29	100.00	AED	expense	cmm60aoac0000ry015m0ptwvq	Al Ain Food And Bevera	شارژ حساب العین	["Al Ain account top-up"]	image	t	{photos/photo_572@20-01-2026_11-29-53.jpg}	2026-02-27 17:48:58.553	2026-02-28 09:58:15.296	\N	default_farnoosh_mashreq	\N
message959	2026-01-26 00:00:00	20:04	224.25	AED	expense	cmm56s17f00078oge3yf8pp6g	Paymob (via Tabby)	\N	["Tabby installment 2 of 4 for Paymob purchase (total 897.00)"]	image	t	{photos/photo_580@26-01-2026_20-04-32.jpg}	2026-02-27 17:48:58.553	2026-02-27 17:48:58.553	\N	default_farnoosh_mashreq	\N
message960	2026-01-26 00:00:00	20:04	141.57	AED	expense	cmm56s17j000a8ogezifv1oi1	Aster Opticals (via Tabby)	\N	["Tabby installment 4 of 4 for Aster Opticals (total 566.25)"]	image	t	{photos/photo_581@26-01-2026_20-04-32.jpg}	2026-02-27 17:48:58.553	2026-02-27 17:48:58.553	\N	default_farnoosh_mashreq	\N
message937	2026-01-18 00:00:00	16:07	135.91	AED	expense	cmm5cqzf10001pw01d9pekwf0	Tamara (Amazon)	\N	["Tamara installment 3 of 4 - total order 543.65 for home supplies from Amazon"]	image	t	{photos/photo_564@18-01-2026_16-07-00.jpg}	2026-02-27 17:48:58.553	2026-02-28 09:59:08.144	\N	default_farnoosh_mashreq	\N
message952	2026-01-26 00:00:00	19:53	48.00	AED	expense	cmm56s17900038ogeyynewip3	\N	۴۸ درهم پول کارواش دادیم22th January04:55 PM	\N	text	f	{}	2026-02-27 17:48:58.553	2026-02-28 09:59:46.269	\N	default_farnoosh_mashreq	\N
message955	2026-01-26 00:00:00	19:56	1226.75	AED	expense	cmm5cqzf10001pw01d9pekwf0	Amazon.ae (via Tabby)	قسط دوم گوشی فرنوش با تبی - Tabby	["Farnoosh phone - Tabby installment 2 of 4"] | ["Farnoosh phone - Tabby pay-in-4 schedule (total 4907.00). Installment 2 of 4 paid 24 Jan"]	image	t	{photos/photo_577@26-01-2026_19-56-20.jpg,photos/photo_578@26-01-2026_19-56-20.jpg}	2026-02-27 17:48:58.553	2026-02-28 09:59:56.265	\N	default_farnoosh_mashreq	\N
message969	2026-01-26 00:00:00	20:21	5000.00	AED	income	cmm56s17000008ogezghgfclk	Mashreq ATM	واریز به حساب از دستگاه ATM	["Cash deposit via ATM - 10 x AED 500 notes, Mashreq DXB Mall Branch"]	image	t	{photos/photo_584@26-01-2026_20-21-22.jpg}	2026-02-27 17:48:58.553	2026-02-27 17:48:58.553	\N	default_farnoosh_mashreq	\N
message970	2026-01-26 00:00:00	20:24	121.51	AED	expense	cmm56s17600018ogeqghk7vfb	Zou Zou Restaurant (via Qlub)	رستوران Zou Zou	["Restaurant meal at Zou Zou"]	image	t	{photos/photo_585@26-01-2026_20-24-19.jpg}	2026-02-27 17:48:58.553	2026-02-27 17:48:58.553	\N	default_farnoosh_mashreq	\N
message971	2026-01-26 00:00:00	20:24	136.81	AED	expense	cmm56s17800028ogefz2eqqt0	Geant (Gmg Consumer Llc)	Geant	["Groceries"]	image	t	{photos/photo_586@26-01-2026_20-24-27.jpg}	2026-02-27 17:48:58.553	2026-02-27 17:48:58.553	\N	default_farnoosh_mashreq	\N
message972	2026-01-26 00:00:00	20:24	155.15	AED	expense	cmm56s17800028ogefz2eqqt0	Choithrams	CHOITHRAMS	["Groceries"]	image	t	{photos/photo_587@26-01-2026_20-24-47.jpg}	2026-02-27 17:48:58.553	2026-02-27 17:48:58.553	\N	default_farnoosh_mashreq	\N
message962	2026-01-26 00:00:00	20:09	47.25	AED	expense	cmm56s17f00078oge3yf8pp6g	Platinumlist (via Tabby)	۴۷.۲۵ درهم قسط سوم تبی برای بلیت قاب دبیکلش ۱۴۱.۷۶ درهم شد	["Tabby installment 3 of 3 for Platinumlist/Dubai Frame ticket (total 141.76)"] | ["Tabby installment 3 of 3 for Platinumlist tickets (total 141.76) - Dubai Frame ticket"]	image	t	{photos/photo_583@26-01-2026_20-09-04.jpg,photos/photo_582@26-01-2026_20-09-04.jpg}	2026-02-27 17:48:58.553	2026-02-27 19:51:37.182	\N	default_farnoosh_mashreq	\N
message961	2026-01-26 00:00:00	20:09	47.25	AED	expense	cmm56s17f00078oge3yf8pp6g	Platinumlist (via Tabby)	\N	["Tabby installment 3 of 3 for Platinumlist tickets (total 141.76) - Dubai Frame ticket"]	image	t	{photos/photo_582@26-01-2026_20-09-04.jpg}	2026-02-27 17:48:58.553	2026-02-27 19:51:37.182	message962	default_farnoosh_mashreq	\N
message958	2026-01-26 00:00:00	20:04	365.82	AED	expense	cmm5cqzf10001pw01d9pekwf0	Tabby Card	قسط تبی - Tabby۲۲۴.۲۵ بابت قسط اول کشتی لوتوس۱۴۱.۵۷ عینک آفتابی سینا	["Tabby card repayment - includes 224.25 (Paymob wrestling/Lotus installment) + 141.57 (Aster Opticals sunglasses Sina)"]	image	t	{photos/photo_579@26-01-2026_20-04-32.jpg}	2026-02-27 17:48:58.553	2026-02-28 10:00:34.424	\N	default_farnoosh_mashreq	\N
cmm6hsxge00018o4saz1p5syc	2025-09-08 00:00:00	19:43	7540.00	AED	expense	cmm5ckzhy0000pw01vktsd04i	\N	هزینه تمدید لایسنس شرکت	\N	manual	f	\N	2026-02-28 15:45:21.757	2026-02-28 15:45:21.757	\N	default_farnoosh_mashreq	\N
message973	2026-01-26 00:00:00	20:24	27.67	AED	expense	cmm56s17800028ogefz2eqqt0	Geant (Gmg Consumer Llc)	Geant	["Groceries"]	image	t	{photos/photo_588@26-01-2026_20-24-51.jpg}	2026-02-27 17:48:58.553	2026-02-27 17:48:58.553	\N	default_farnoosh_mashreq	\N
message976	2026-01-28 00:00:00	10:23	154.00	AED	expense	cmm56s17600018ogeqghk7vfb	The Lounge	پیتزا۷۲تاش برای نگینه۸۲تاش برای ماست	["pizza","mast (yogurt)"]	image	t	{photos/photo_589@28-01-2026_10-23-10.jpg}	2026-02-27 17:48:58.553	2026-02-27 17:48:58.553	\N	default_farnoosh_mashreq	\N
message984	2026-01-28 00:00:00	23:39	63.59	AED	expense	cmm5cqzf10001pw01d9pekwf0	Amazon.ae	\N	["Frances rope woven tissue box cover 23.59","SPNOR ceramic ribbed vase 32.00","shipping 8.00"]	file	t	{"files/Order Details 5.pdf"}	2026-02-27 17:48:58.553	2026-02-28 10:01:30.514	\N	default_farnoosh_mashreq	\N
message979	2026-01-28 00:00:00	14:29	49.00	AED	expense	cmm56s17a00048ogeacrpia4x	du	شارژ سیم کارت فرید	["SIM card recharge for Farid"]	image	t	{photos/photo_590@28-01-2026_14-29-41.jpg}	2026-02-27 17:48:58.553	2026-02-27 17:48:58.553	\N	default_farnoosh_mashreq	\N
message983	2026-01-28 00:00:00	23:39	25.75	AED	expense	cmm5cqzf10001pw01d9pekwf0	Amazon.ae	\N	["ARIS hand sanitizer spray 250ml 15.75","shipping 10.00"]	file	t	{"files/Order Details 4.pdf"}	2026-02-27 17:48:58.553	2026-02-28 10:01:42.359	\N	default_farnoosh_mashreq	\N
message986	2026-01-28 00:00:00	23:51	46.54	AED	expense	cmm56s17800028ogefz2eqqt0	Amazon.ae	خرید از آمازون	["Dac toilet cleaner rim block 17.75","Fine kitchen super towel 11.37","Fine deluxe toilet tissues 7.69","LUX body wash 25.82","Mr. Muscle sink and drain gel 13.91","promotion -30.00"]	file	t	{"files/Order Details 2.pdf"}	2026-02-27 17:48:58.553	2026-02-28 10:02:17.254	\N	default_farnoosh_mashreq	\N
message998	2026-01-30 00:00:00	20:37	27.80	AED	expense	cmm56s17600018ogeqghk7vfb	Talabat	معجون از سندباد	["toothpaste from Sindbad via Talabat"]	image	t	{photos/photo_598@30-01-2026_20-37-33.jpg}	2026-02-27 17:48:58.553	2026-02-27 17:48:58.553	\N	default_farnoosh_mashreq	\N
message999	2026-01-30 00:00:00	20:38	120.20	AED	expense	cmm56s17800028ogefz2eqqt0	Seyed Kazem Mirjalili General Trading	سید کاظم میرجلیلی	["N Golestan baking soda 180g 5.00","N Haraz cream 200ml 6.00","N Haraz shallot yoghurt 450g x2 14.01","Abeli doogh 1L 10.00","Golestan dried thyme 35g 3.00","Taksa dry mint 150g 10.00","kiwi green 0.97kg 9.69","Kambiz olive pickle pitted 450g 15.00","N Pamchal cucumber pickle 1040g 12.00","shopping bag x2 0.50","strawberry tray 15.00","persimmon tray 20.00"]	image	t	{photos/photo_599@30-01-2026_20-38-30.jpg}	2026-02-27 17:48:58.553	2026-02-27 17:48:58.553	\N	default_farnoosh_mashreq	\N
message1001	2026-01-30 00:00:00	20:39	368.43	AED	expense	cmm56s17800028ogefz2eqqt0	Tavazo Trading Co. LLC	تواضع	["pumpkin seeds M 0.54kg 37.80","mix nuts 1.075kg 182.75","sugarfree malban mix 70.00","Iranian special tea box 55.00","dry fruits plum slice 0.305kg 22.88"]	image	t	{photos/photo_600@30-01-2026_20-39-51.jpg}	2026-02-27 17:48:58.553	2026-02-27 17:48:58.553	\N	default_farnoosh_mashreq	\N
message1002	2026-01-30 00:00:00	20:40	257.06	AED	expense	cmm56s17800028ogefz2eqqt0	Geant	Geant	["groceries from Geant (Gmg Consumer Llc)"]	image	t	{photos/photo_601@30-01-2026_20-40-15.jpg}	2026-02-27 17:48:58.553	2026-02-27 17:48:58.553	\N	default_farnoosh_mashreq	\N
message1003	2026-01-30 00:00:00	20:40	10.00	AED	expense	cmm56s17800028ogefz2eqqt0	Geant	Geant	["shopping bag from Geant (Gmg Consumer Llc)"]	image	t	{photos/photo_602@30-01-2026_20-40-24.jpg}	2026-02-27 17:48:58.553	2026-02-27 17:48:58.553	\N	default_farnoosh_mashreq	\N
message1004	2026-01-30 00:00:00	20:40	67.85	AED	expense	cmm56s17800028ogefz2eqqt0	Spinneys	Spinneys	["groceries from Spinneys Sobha Hartland"]	image	t	{photos/photo_603@30-01-2026_20-40-51.jpg}	2026-02-27 17:48:58.622	2026-02-27 17:48:58.622	\N	default_farnoosh_mashreq	\N
message994	2026-01-29 00:00:00	10:01	106.81	AED	expense	cmm56s17800028ogefz2eqqt0	Carrefour	کارفور	["groceries from Carrefour"] | ["Carrefour order confirmation - 6 items via Apple Pay"]	image	t	{photos/photo_595@29-01-2026_10-01-49.jpg,photos/photo_596@29-01-2026_10-01-49.jpg}	2026-02-27 17:48:58.553	2026-02-27 19:50:28.541	\N	default_farnoosh_mashreq	\N
message995	2026-01-29 00:00:00	10:01	106.81	AED	expense	cmm56s17800028ogefz2eqqt0	Carrefour	\N	["Carrefour order confirmation - 6 items via Apple Pay"]	image	t	{photos/photo_596@29-01-2026_10-01-49.jpg}	2026-02-27 17:48:58.553	2026-02-27 19:50:28.541	message994	default_farnoosh_mashreq	\N
message977	2026-01-28 00:00:00	10:23	554.52	AED	expense	cmm56s17a00048ogeacrpia4x	DEWA	قبض دیواDewa | رسید پرداخت قبض دیواDewa	["electricity 60.36","water 120.17","housing fee 325.00","sewerage 48.99"] | ["DEWA bill payment receipt"]	file	t	{"files/Bill (9).pdf","files/Receipt (9).pdf"}	2026-02-27 17:48:58.553	2026-02-27 19:50:57.967	\N	default_farnoosh_mashreq	\N
message978	2026-01-28 00:00:00	10:23	554.52	AED	expense	cmm56s17a00048ogeacrpia4x	DEWA	رسید پرداخت قبض دیواDewa	["DEWA bill payment receipt"]	file	t	{"files/Receipt (9).pdf"}	2026-02-27 17:48:58.553	2026-02-27 19:50:57.967	message977	default_farnoosh_mashreq	\N
message988	2026-01-28 00:00:00	23:53	61.70	AED	expense	cmm5cqzf10001pw01d9pekwf0	Tabby	۶۱.۷۰ درهم قسط اول تبی برای خرید لوستر و ساعت دیواری از آمازونکلش ۲۴۶.۷۸ درهم شد	["Tabby installment 1 of 4 for Amazon.ae chandelier and wall clock order (total 246.78)"]	image	t	{photos/photo_591@28-01-2026_23-53-04.jpg}	2026-02-27 17:48:58.553	2026-02-28 10:03:41.716	\N	default_farnoosh_mashreq	\N
message987	2026-01-28 00:00:00	23:52	0.00	AED	expense	cmm5cqzf10001pw01d9pekwf0	Amazon.ae	خرید ساعت دیواری و لوستر از آمازون	["Forrio 3 rings modern LED chandelier 119.98","KEQAM large world map wall clock 126.80","shipping 10.00","promotion -10.00"]	file	t	{"files/Order Details (3).pdf"}	2026-02-27 17:48:58.553	2026-02-28 10:03:53.443	\N	default_farnoosh_mashreq	\N
message993	2026-01-29 00:00:00	00:06	17.50	AED	expense	cmm5cqzf10001pw01d9pekwf0	Tabby	۱۷.۵۰ درهم بابت قسط اول تبی برای خرید از هوم سنتر - homecentreکلش ۷۰ درهم شد	["Tabby installment 1 of 4 for Home Centre order (total 70)"]	image	t	{photos/photo_594@29-01-2026_00-06-49.jpg}	2026-02-27 17:48:58.553	2026-02-28 10:04:29.011	\N	default_farnoosh_mashreq	\N
message996	2026-01-29 00:00:00	15:14	80.00	AED	expense	cmm56s17a00048ogeacrpia4x	\N	۸۰ درهم بابت تمیزکردن بالکن دادیم29th January01:58 PM	\N	text	f	{}	2026-02-27 17:48:58.553	2026-02-28 10:04:39.486	\N	default_farnoosh_mashreq	\N
message997	2026-01-29 00:00:00	15:16	80.00	AED	expense	cmm56s17a00048ogeacrpia4x	Handyman	۸۰ درهم بابت وصل کردن لوستر دادیم29th January02:05 PM	["chandelier installation service"]	image	t	{photos/photo_597@29-01-2026_15-16-04.jpg}	2026-02-27 17:48:58.553	2026-02-28 10:04:45.097	\N	default_farnoosh_mashreq	\N
cmm7te3m8000m8o2561jw4mc9	2026-02-28 20:00:00	\N	127.48	AED	expense	\N	TABBY FZ LLC	Card *5707	\N	sms	f	\N	2026-03-01 13:57:31.472	2026-03-01 13:57:31.472	\N	default_farnoosh_mashreq	\N
message1005	2026-01-30 00:00:00	20:41	141.75	AED	expense	cmm56s17600018ogeqghk7vfb	Kebab Khodmooni Restaurant	کباب خودمونی	["homestyle kebab dinner"]	image	t	{photos/photo_604@30-01-2026_20-41-54.jpg}	2026-02-27 17:48:58.622	2026-02-27 17:48:58.622	\N	default_farnoosh_mashreq	\N
message1007	2026-02-01 00:00:00	10:33	48.00	AED	expense	cmm56s17900038ogeyynewip3	ENOC	کارواش	["car wash at ENOC-1073"]	image	t	{photos/photo_606@01-02-2026_10-33-59.jpg}	2026-02-27 17:48:58.622	2026-02-27 17:48:58.622	\N	default_farnoosh_mashreq	\N
message1008	2026-02-01 00:00:00	10:34	40.00	AED	expense	cmm56s17900038ogeyynewip3	ENOC	بنزین	["Fuel/Gasoline"]	image	t	{photos/photo_607@01-02-2026_10-34-05.jpg}	2026-02-27 17:48:58.622	2026-02-27 17:48:58.622	\N	default_farnoosh_mashreq	\N
message1009	2026-02-01 00:00:00	10:34	45.00	AED	expense	cmm56s17800028ogefz2eqqt0	Spinneys Sobha Hartland	خرید گل	["Flowers"]	image	t	{photos/photo_608@01-02-2026_10-34-23.jpg}	2026-02-27 17:48:58.622	2026-02-27 17:48:58.622	\N	default_farnoosh_mashreq	\N
message1010	2026-02-01 00:00:00	10:34	49.00	AED	expense	cmm56s17600018ogeqghk7vfb	Subway	Subway	["Subway meal"]	image	t	{photos/photo_609@01-02-2026_10-34-33.jpg}	2026-02-27 17:48:58.622	2026-02-27 17:48:58.622	\N	default_farnoosh_mashreq	\N
message1011	2026-02-01 00:00:00	10:35	54.00	AED	expense	cmm56s17600018ogeqghk7vfb	KFC	KFC	["KFC meal"]	image	t	{photos/photo_610@01-02-2026_10-35-01.jpg}	2026-02-27 17:48:58.622	2026-02-27 17:48:58.622	\N	default_farnoosh_mashreq	\N
message1006	2026-01-30 00:00:00	23:51	448.50	AED	expense	cmm56s17f00078oge3yf8pp6g	Tabby	2 تا قسط کشتیبرای. کنسل کردن tabby	["2 Tabby installments cancellation payment for boat/cruise"]	image	t	{photos/photo_605@30-01-2026_23-51-57.jpg}	2026-02-27 17:48:58.622	2026-02-28 10:05:15.173	\N	default_farnoosh_mashreq	\N
message1015	2026-02-02 00:00:00	00:26	20.00	AED	expense	cmm56s17600018ogeqghk7vfb	Noqodi Global Village	سیمیت سینا در global village	["Global Village SIM/card top-up"]	image	t	{photos/photo_614@02-02-2026_00-26-07.jpg}	2026-02-27 17:48:58.622	2026-02-28 10:06:09.29	\N	default_farnoosh_mashreq	\N
message1014	2026-02-02 00:00:00	00:24	101.00	AED	expense	cmm56s17f00078oge3yf8pp6g	Platinumlist	بلیت global village با فریدینا	["Global Village ticket"]	image	t	{photos/photo_613@02-02-2026_00-24-38.jpg}	2026-02-27 17:48:58.622	2026-02-27 17:48:58.622	\N	default_farnoosh_mashreq	\N
message1016	2026-02-02 00:00:00	00:26	75.00	AED	expense	cmm56s17600018ogeqghk7vfb	Noqodi Global Village	نوشیدنی منو فرید و پریسا	["Drinks for Farnoosh, Farid and Parisa"]	image	t	{photos/photo_615@02-02-2026_00-26-23.jpg}	2026-02-27 17:48:58.622	2026-02-27 17:48:58.622	\N	default_farnoosh_mashreq	\N
message1017	2026-02-02 00:00:00	00:27	79.00	AED	expense	cmm56s17g00088oge05l6cktv	LC Waikiki	کاپشن پریسا	["Capshon/jacket for Parisa"]	image	t	{photos/photo_616@02-02-2026_00-27-21.jpg}	2026-02-27 17:48:58.622	2026-02-27 17:48:58.622	\N	default_farnoosh_mashreq	\N
message1018	2026-02-02 00:00:00	00:31	299.11	AED	expense	cmm56s17600018ogeqghk7vfb	Eataly Dubai Hills Mall	رستوران Eataly	["1x Raviolone Ripieno (89.00)","1x Pizza Funghi E Tartufo (139.00)","1x Biere Des Amis 0.0% Beer 330ml (39.00)","1x Lemonade Juice (29.00)","Service Fee (3.11)"]	image	t	{photos/photo_617@02-02-2026_00-31-28.jpg}	2026-02-27 17:48:58.622	2026-02-27 17:48:58.622	\N	default_farnoosh_mashreq	\N
message1019	2026-02-02 00:00:00	17:55	92.00	AED	expense	cmm56s17j000a8ogezifv1oi1	Aston Pharmacy LLC - Sobha Hartland	خرید داروخانه۷۰ درهمش برای وارفارین مامانهبقیه‌اش برای قرص پریساس	["Warfarin (medication)","Parisa pills"]	image	t	{photos/photo_618@02-02-2026_17-55-39.jpg}	2026-02-27 17:48:58.622	2026-02-27 17:48:58.622	\N	default_farnoosh_mashreq	\N
message1020	2026-02-02 00:00:00	17:55	44.17	AED	expense	cmm56s17800028ogefz2eqqt0	Geant (Gmg Consumer Llc)	Geant	["Groceries"]	image	t	{photos/photo_619@02-02-2026_17-55-51.jpg}	2026-02-27 17:48:58.622	2026-02-27 17:48:58.622	\N	default_farnoosh_mashreq	\N
message1021	2026-02-09 00:00:00	11:48	100.00	AED	expense	cmm56s17a00048ogeacrpia4x	du	شارژ du حساب سینا	["du phone/internet bill recharge"]	image	t	{photos/photo_620@09-02-2026_11-48-06.jpg}	2026-02-27 17:48:58.622	2026-02-27 17:48:58.622	\N	default_farnoosh_mashreq	\N
message1022	2026-02-09 00:00:00	11:48	93.00	AED	expense	cmm56s17600018ogeqghk7vfb	Starbucks	استارباکس با فریدینا	["Starbucks coffee/drinks"]	image	t	{photos/photo_621@09-02-2026_11-48-43.jpg}	2026-02-27 17:48:58.622	2026-02-27 17:48:58.622	\N	default_farnoosh_mashreq	\N
message1023	2026-02-09 00:00:00	11:48	60.00	AED	expense	cmm56s17900038ogeyynewip3	Public Parking JBR	پارکینگ JBR	["Parking at JBR"]	image	t	{photos/photo_622@09-02-2026_11-48-55.jpg}	2026-02-27 17:48:58.622	2026-02-27 17:48:58.622	\N	default_farnoosh_mashreq	\N
message1024	2026-02-09 00:00:00	11:49	295.98	AED	expense	cmm56s17800028ogefz2eqqt0	Geant (Gmg Consumer Llc)	Geant	["Groceries"]	image	t	{photos/photo_623@09-02-2026_11-49-10.jpg}	2026-02-27 17:48:58.622	2026-02-27 17:48:58.622	\N	default_farnoosh_mashreq	\N
message1025	2026-02-09 00:00:00	11:49	12.00	AED	expense	cmm56s17800028ogefz2eqqt0	MMI	MMI	["Beverages/alcohol"]	image	t	{photos/photo_624@09-02-2026_11-49-17.jpg}	2026-02-27 17:48:58.622	2026-02-27 17:48:58.622	\N	default_farnoosh_mashreq	\N
message1026	2026-02-09 00:00:00	11:49	52.50	AED	expense	cmm56s17600018ogeqghk7vfb	Kaf Cafe	Kaf Cafe توی محله‌مون	["Cafe order (neighborhood cafe)"]	image	t	{photos/photo_625@09-02-2026_11-49-38.jpg}	2026-02-27 17:48:58.622	2026-02-27 17:48:58.622	\N	default_farnoosh_mashreq	\N
message1027	2026-02-09 00:00:00	11:50	171.79	AED	expense	cmm56s17600018ogeqghk7vfb	Zaza	Zaza - زازابا نگین اینا۱۰۱ درهم برای نگین ایناست۷۱ درهم برای ماست	["Food for Negin/Ina (101 AED)","Food/drink (71 AED)"]	image	t	{photos/photo_626@09-02-2026_11-50-04.jpg}	2026-02-27 17:48:58.622	2026-02-27 17:48:58.622	\N	default_farnoosh_mashreq	\N
message1028	2026-02-09 00:00:00	11:50	28.00	AED	expense	cmm56s17j000a8ogezifv1oi1	Aster Pharmacy - Sobha Hartland	داروخانه برای قرمزی پای سینا	["Medicine for Sina (redness/rash on foot)"]	image	t	{photos/photo_627@09-02-2026_11-50-26.jpg}	2026-02-27 17:48:58.622	2026-02-27 17:48:58.622	\N	default_farnoosh_mashreq	\N
message1032	2026-02-15 00:00:00	13:38	250.76	AED	expense	cmm5cqzf10001pw01d9pekwf0	Tabby	قسط‌های تبی خریدهای مامانقسط ۳ و ۴ باهم دادم تموم شد	["Tabby installments 3 and 4 for mom's purchases (paid off, 6 Jan - 5 Feb)"]	image	t	{photos/photo_629@15-02-2026_13-38-37.jpg}	2026-02-27 17:48:58.622	2026-02-28 10:07:07.163	\N	default_farnoosh_mashreq	\N
message1030	2026-02-09 00:00:00	15:18	331.30	AED	expense	cmm56s17j000a8ogezifv1oi1	Aster Online (myAster)	مولتی ویتامین و پریورین فرنوش	["1x Priorin N Hair Loss Supplement Capsules 90s (284.05)","1x Chewy Vites Women's Multivitamin Supplement Adult Gummies 60s (44.25)","Service Fee (3.00)"]	file	t	{files/invoice_26040130290.pdf}	2026-02-27 17:48:58.622	2026-02-27 17:48:58.622	\N	default_farnoosh_mashreq	\N
message1031	2026-02-15 00:00:00	13:38	75.99	AED	expense	cmm56s17800028ogefz2eqqt0	Geant (Gmg Consumer Llc)	Geant	["Groceries"]	image	t	{photos/photo_628@15-02-2026_13-38-13.jpg}	2026-02-27 17:48:58.622	2026-02-27 17:48:58.622	\N	default_farnoosh_mashreq	\N
message1029	2026-02-09 00:00:00	11:50	5000.00	AED	income	cmm56s17i00098oge2xb5or4t	Mashreq Bank	کارت به کارت از حساب شرکت به حساب خودم	["Fund transfer from company account (Farnoosh Bagheri Project Management) to personal account (Farnoosh Bagheri)"]	file	t	{files/M090226675763WAM.PDF}	2026-02-27 17:48:58.622	2026-02-27 20:57:58.176	\N	default_farnoosh_mashreq	\N
message1035	2026-02-15 00:00:00	13:42	72.35	AED	expense	cmm56s17800028ogefz2eqqt0	Geant (Gmg Consumer Llc)	Geant	["Grocery shopping at Geant"]	image	t	{photos/photo_632@15-02-2026_13-42-12.jpg}	2026-02-27 17:48:58.622	2026-02-27 17:48:58.622	\N	default_farnoosh_mashreq	\N
message1036	2026-02-15 00:00:00	13:42	66.59	AED	expense	cmm56s17800028ogefz2eqqt0	Choithrams	CHOITHRAMS	["Grocery shopping at Choithrams"]	image	t	{photos/photo_633@15-02-2026_13-42-21.jpg}	2026-02-27 17:48:58.622	2026-02-27 17:48:58.622	\N	default_farnoosh_mashreq	\N
message1034	2026-02-15 00:00:00	13:38	59.75	AED	expense	cmm56s17g00088oge05l6cktv	Skechers	\N	["Footwear/clothing purchase via Tabby (4 installments of 59.75)"]	image	t	{photos/photo_631@15-02-2026_13-38-37.jpg}	2026-02-27 17:48:58.622	2026-02-28 10:07:37.16	\N	default_farnoosh_mashreq	\N
message1033	2026-02-15 00:00:00	13:38	65.64	AED	expense	cmm56s17g00088oge05l6cktv	LC Waikiki	\N	["Clothing purchase via Tabby (4 installments of ~65.62)"]	image	t	{photos/photo_630@15-02-2026_13-38-37.jpg}	2026-02-27 17:48:58.622	2026-02-28 10:07:49.57	\N	default_farnoosh_mashreq	\N
message1038	2026-02-15 00:00:00	13:45	132.04	AED	expense	cmm5cqzf10001pw01d9pekwf0	Amazon	قسط سوم تامارا برای خرید از آمازون	["Tamara installment payment (3rd of 4) for Amazon purchase"] | ["Amazon order total (4 installments of ~132.04, total 528.18 incl. 5.49 processing fee)"]	image	t	{photos/photo_634@15-02-2026_13-45-57.jpg,photos/photo_635@15-02-2026_13-45-57.jpg}	2026-02-27 17:48:58.622	2026-02-28 10:08:05.317	\N	default_farnoosh_mashreq	\N
message1042	2026-02-15 00:00:00	13:50	4.00	AED	expense	cmm56s17900038ogeyynewip3	Parking (RTA/Parkin)	پارکینگ	["Parking fee, location 326C, 1 hour, 13/02/2026"]	image	t	{photos/photo_638@15-02-2026_13-50-34.jpg}	2026-02-27 17:48:58.622	2026-02-27 17:48:58.622	\N	default_farnoosh_mashreq	\N
message1043	2026-02-15 00:00:00	13:51	48.93	AED	expense	cmm56s17800028ogefz2eqqt0	Primerush Grocery Store	خرید از سوپرمارکت ایرانی Primerush	["Iranian supermarket grocery shopping"]	image	t	{photos/photo_639@15-02-2026_13-51-04.jpg}	2026-02-27 17:48:58.622	2026-02-27 17:48:58.622	\N	default_farnoosh_mashreq	\N
message1044	2026-02-15 00:00:00	13:51	2.00	AED	expense	cmm56s17900038ogeyynewip3	Parking (RTA/Parkin)	پارکینگ	["Parking fee, location 356C, 1 hour, 13/02/2026"]	image	t	{photos/photo_640@15-02-2026_13-51-22.jpg}	2026-02-27 17:48:58.622	2026-02-27 17:48:58.622	\N	default_farnoosh_mashreq	\N
message1045	2026-02-15 00:00:00	13:51	80.01	AED	expense	cmm56s17900038ogeyynewip3	ENOC	بنزین	["Fuel/petrol"]	image	t	{photos/photo_641@15-02-2026_13-51-41.jpg}	2026-02-27 17:48:58.622	2026-02-27 17:48:58.622	\N	default_farnoosh_mashreq	\N
message1046	2026-02-15 00:00:00	13:51	397.87	AED	expense	cmm56s17800028ogefz2eqqt0	Geant (Gmg Consumer Llc)	Geant	["Grocery shopping at Geant"]	image	t	{photos/photo_642@15-02-2026_13-51-51.jpg}	2026-02-27 17:48:58.622	2026-02-27 17:48:58.622	\N	default_farnoosh_mashreq	\N
message1047	2026-02-15 00:00:00	23:49	50.00	AED	expense	cmm56s17a00048ogeacrpia4x	du	اینترنت du سینا	["Internet service (du) for Sina"]	image	t	{photos/photo_643@15-02-2026_23-49-59.jpg}	2026-02-27 17:48:58.622	2026-02-27 17:48:58.622	\N	default_farnoosh_mashreq	\N
message1048	2026-02-24 00:00:00	14:32	128.25	AED	expense	cmm56s17g00088oge05l6cktv	Centrepoint	لباس ورزشی فرنوش	Leggings, t-shirt (Farnoosh sportswear)	image	t	{photos/photo_644@24-02-2026_14-32-19.jpg}	2026-02-27 17:48:58.622	2026-02-27 17:48:58.622	\N	default_farnoosh_mashreq	\N
message1054	2026-02-24 00:00:00	14:44	60.00	AED	expense	cmm56s17900038ogeyynewip3	Public Parking (JBR)	پارکینگ JBR	["Parking at JBR (Jumeirah Beach Residence)"]	image	t	{photos/photo_649@24-02-2026_14-44-17.jpg}	2026-02-27 17:48:58.622	2026-02-27 17:48:58.622	\N	default_farnoosh_mashreq	\N
message1055	2026-02-24 00:00:00	14:44	182.00	AED	expense	cmm56s17600018ogeqghk7vfb	Rivas Restaurant	ریواس	["Dining at Rivas Restaurant"]	image	t	{photos/photo_650@24-02-2026_14-44-49.jpg}	2026-02-27 17:48:58.622	2026-02-27 17:48:58.622	\N	default_farnoosh_mashreq	\N
message1058	2026-02-24 00:00:00	14:47	159.36	AED	expense	cmm56s17j000a8ogezifv1oi1	Aster Pharmacy	خرید محصولات بهداشتی فرنوش از داروخانه aster	["Personal care / hygiene products for Farnoosh from Aster Pharmacy"]	image	t	{photos/photo_652@24-02-2026_14-47-52.jpg}	2026-02-27 17:48:58.622	2026-02-27 17:48:58.622	\N	default_farnoosh_mashreq	\N
message1059	2026-02-24 00:00:00	14:48	159.36	AED	expense	cmm56s17j000a8ogezifv1oi1	Aster Pharmacy (Aster Online)	\N	["Color Wow Dream Coat Anti Frizz Hair Spray 50ml (61.43)","CeraVe Resurfacing Retinol Face Serum 30ml (84.85)","Johnson's Cotton Make-up Pads 80s (10.08)","Service Fee (3.00)"]	file	t	{files/Invoice-26052413925.pdf}	2026-02-27 17:48:58.622	2026-02-27 17:48:58.622	\N	default_farnoosh_mashreq	\N
message1060	2026-02-24 00:00:00	14:54	18.00	AED	expense	cmm5cqzf10001pw01d9pekwf0	Namshi	۱۸ درهم از namshi تل مو خریدم21th February04:12 PM	\N	text	f	{}	2026-02-27 17:48:58.622	2026-02-27 20:39:03.654	\N	default_farnoosh_mashreq	\N
message1040	2026-02-15 00:00:00	13:48	22.50	AED	expense	cmm5cqzf10001pw01d9pekwf0	Landmark Group (HomeBox via Tamara)	\N	["Tamara installment payment (4th of 4) for Landmark Group / HomeBox purchase"]	image	t	{photos/photo_636@15-02-2026_13-48-49.jpg}	2026-02-27 17:48:58.622	2026-02-27 20:42:53.48	\N	default_farnoosh_mashreq	\N
message1041	2026-02-15 00:00:00	13:48	90.00	AED	expense	cmm5cqzf10001pw01d9pekwf0	HomeBox (Landmark Group via Tamara)	قسط آخر تامارا بابت خرید جای سیب زمینی و پیاز از homebox	["HomeBox order total (4 installments of 22.50, total 90.00, potato and onion replacement items)"]	image	t	{photos/photo_637@15-02-2026_13-48-49.jpg}	2026-02-27 17:48:58.622	2026-02-27 20:43:34.012	\N	default_farnoosh_mashreq	\N
message1053	2026-02-24 00:00:00	14:43	90.00	AED	expense	cmm56s17600018ogeqghk7vfb	subway	۹۰ درهم از subway ساندویچ خریدیم19th February12:47 PM	["Salik account recharge (toll gate), vehicle Dubai V 18602"]	text	f	{}	2026-02-27 17:48:58.622	2026-02-28 10:17:34.443	\N	default_farnoosh_mashreq	\N
message1039	2026-02-15 00:00:00	13:45	528.18	AED	expense	cmm56s17c00058ogea78vq636	Amazon (via Tamara)	قسط سوم تامارا برای خرید از آمازون	["Amazon order total (4 installments of ~132.04, total 528.18 incl. 5.49 processing fee)"]	image	t	{photos/photo_635@15-02-2026_13-45-57.jpg}	2026-02-27 17:48:58.622	2026-02-27 20:45:10.96	message1038	default_farnoosh_mashreq	\N
message1052	2026-02-24 00:00:00	14:41	50.00	USD	expense	cmm56s17900038ogeyynewip3	Salik	شارژ حساب سالیک	["PS game purchase from checkout.playstation.com"]	image	t	{photos/photo_648@24-02-2026_14-41-07.jpg}	2026-02-27 17:48:58.622	2026-02-28 11:49:48.472	\N	default_farnoosh_mashreq	\N
message1051	2026-02-24 00:00:00	14:39	19.61	AED	expense	cmm56s17f00078oge3yf8pp6g	 PlayStation	خرید بازی برای ps	["Grocery shopping at Geant"]	image	t	{photos/photo_647@24-02-2026_14-39-59.jpg}	2026-02-27 17:48:58.622	2026-02-28 10:20:56.662	\N	default_farnoosh_mashreq	\N
message1050	2026-02-24 00:00:00	14:39	165.37	AED	expense	cmm56s17800028ogefz2eqqt0	Geant (Gmg Consumer Llc)	Geant	["Restaurant dining at Paul"]	image	t	{photos/photo_646@24-02-2026_14-39-47.jpg}	2026-02-27 17:48:58.622	2026-02-28 10:21:06.408	\N	default_farnoosh_mashreq	\N
message1049	2026-02-24 00:00:00	14:39	199.07	AED	expense	cmm56s17600018ogeqghk7vfb	Paul (restaurant via Qlub) 	رستوران paul	["Leggings (79.00)","T-Shirt (49.00)","CP Paper Bag Small (0.25)"]	image	t	{photos/photo_645@24-02-2026_14-39-36.jpg}	2026-02-27 17:48:58.622	2026-02-28 10:22:17.512	\N	default_farnoosh_mashreq	\N
cmm6fdwd800108o1s6txskla3	2025-04-26 00:00:00	16:12	48.20	AED	expense	cmm56s17800028ogefz2eqqt0	Geant	Geant	\N	image	t	{media-sina/photos/photo_7@26-04-2025_16-12-13.jpg}	2026-02-28 14:37:41.276	2026-02-28 15:10:03.662	\N	cmm6fbnk800008o9w89ze2ol6	\N
message1061	2026-02-24 00:00:00	14:57	84.00	AED	expense	cmm56s17g00088oge05l6cktv	Namshi	خرید برس فرنوش از namshiجمعا ۸۴ درهم	["TANGLE TEEZER Ultimate Detangler - Rose - AED 72.0","Shipping Fee - AED 12.0"]	file	t	{files/invoice-token.pdf}	2026-02-27 17:48:58.622	2026-02-27 17:48:58.622	\N	default_farnoosh_mashreq	\N
message1062	2026-02-24 00:00:00	14:59	55.00	AED	expense	cmm56s17600018ogeqghk7vfb	Hns Restaurant	خرید غذا از پارک دم خونه ماه رمضون	["Food purchase from park near home (Ramadan) - AED 55.0"]	image	t	{photos/photo_653@24-02-2026_14-59-17.jpg}	2026-02-27 17:48:58.622	2026-02-27 17:48:58.622	\N	default_farnoosh_mashreq	\N
message1063	2026-02-24 00:00:00	14:59	185.69	AED	expense	cmm56s17800028ogefz2eqqt0	Geant (Gmg Consumer Llc)	Geant	["Groceries from Geant - AED 185.69"]	image	t	{photos/photo_654@24-02-2026_14-59-29.jpg}	2026-02-27 17:48:58.622	2026-02-27 17:48:58.622	\N	default_farnoosh_mashreq	\N
message1064	2026-02-24 00:00:00	15:00	36.50	AED	expense	cmm56s17600018ogeqghk7vfb	Hattan Investments Llc	خرید خوراکی برای قایق حتا	["Snacks/food for boat trip (Hatta) - AED 36.5"]	image	t	{photos/photo_655@24-02-2026_15-00-42.jpg}	2026-02-27 17:48:58.622	2026-02-27 17:48:58.622	\N	default_farnoosh_mashreq	\N
message1065	2026-02-24 00:00:00	15:02	192.77	AED	expense	cmm56s17800028ogefz2eqqt0	Geant (Gmg Consumer Llc)	Geant	["Groceries from Geant - AED 192.77"]	image	t	{photos/photo_656@24-02-2026_15-02-53.jpg}	2026-02-27 17:48:58.622	2026-02-27 17:48:58.622	\N	default_farnoosh_mashreq	\N
message1066	2026-02-24 00:00:00	15:03	122.33	AED	expense	cmm56s17800028ogefz2eqqt0	Choithrams (T Choithram And Sons Li)	CHOITHRAMS	["Groceries from Choithrams - AED 122.33"]	image	t	{photos/photo_657@24-02-2026_15-03-07.jpg}	2026-02-27 17:48:58.622	2026-02-27 17:48:58.622	\N	default_farnoosh_mashreq	\N
message1072	2026-02-24 00:00:00	15:09	17.50	AED	expense	cmm5cqzf10001pw01d9pekwf0	Home Centre (via Tabby)	\N	["Tabby installment 2 of 4 for plates and mop from Home Centre (total 70) - AED 17.5"] | ["Tabby installment 2 of 4 for plates and mop from Home Centre - payment schedule detail (total 70) - AED 17.5"] | ["Tabby installment 2 of 4 for plates and mop from Home Centre - payment schedule detail (total 70) - AED 17.5"] | ["Tabby installment 2 of 4 for plates and mop from Home Centre - payment schedule detail (total 70) - AED 17.5"]	image	t	{photos/photo_661@24-02-2026_15-09-18.jpg,photos/photo_662@24-02-2026_15-09-18.jpg}	2026-02-27 17:48:58.622	2026-02-28 10:12:15.283	\N	default_farnoosh_mashreq	\N
message1070	2026-02-24 00:00:00	15:09	61.69	AED	expense	cmm5cqzf10001pw01d9pekwf0	Amazon.ae (via Tabby)	۶۱.۶۹ درهم قسط دوم تبی برای خرید لوستر و ساعت دیواری از آمازونکلش ۲۴۶.۷۸ درهم شد	["Tabby installment 2 of 4 for chandelier and wall clock from Amazon (total 246.78) - AED 61.69"] | ["Tabby installment 2 of 4 for chandelier and wall clock from Amazon - payment schedule detail (total 246.78) - AED 61.69"] | ["Tabby installment 2 of 4 for chandelier and wall clock from Amazon - payment schedule detail (total 246.78) - AED 61.69"]	image	t	{photos/photo_659@24-02-2026_15-09-03.jpg,photos/photo_660@24-02-2026_15-09-03.jpg}	2026-02-27 17:48:58.622	2026-02-28 10:12:22.357	\N	default_farnoosh_mashreq	\N
message1074	2026-02-24 00:00:00	20:37	258.17	AED	expense	cmm56s17j000a8ogezifv1oi1	Aster Pharmacy (myAster)	خرید محصولات بهداشتی فرنوش از داروخانه aster	["Torriden Dive In Hyaluronic Acid Soothing Face Cream 100ml - AED 77.35","Dr. Althea 345 Relief Cream 50ml - AED 93.15","Vichy Mineral 89 Fortifying & Plumping Daily Serum 50ml - AED 84.67","Service Fee - AED 3.0"]	file	t	{files/Invoice-26055742168.pdf}	2026-02-27 17:48:58.622	2026-02-27 17:48:58.622	\N	default_farnoosh_mashreq	\N
message1075	2026-02-24 00:00:00	20:39	1226.75	AED	expense	cmm5cqzf10001pw01d9pekwf0	Amazon.ae (via Tabby)	قسط سوم گوشی فرنوش با تبی - Tabby	["Tabby installment 3 of 4 for Farnoosh's phone from Amazon - AED 1226.75"]	image	t	{photos/photo_663@24-02-2026_20-39-06.jpg}	2026-02-27 17:48:58.622	2026-03-01 13:01:41.089	\N	default_farnoosh_mashreq	\N
message1056	2026-02-24 00:00:00	14:45	190.50	AED	expense	cmm56s17j000a8ogezifv1oi1	Life Pharmacy	خرید محصولات بهداشتی فرنوش از داروخانه life	["Personal care / hygiene products for Farnoosh"] | ["The Ordinary Glycolic Acid 7% Toning Solution 240ml (39.90)","Mielle Rosemary Mint Scalp & Hair Strengthening Oil 2oz (28.35)","Cerave Foaming Facial Cleanser 473ml (57.70)","Some By Mi Retinol Intense Advanced Triple Action Eye Cream 30ml (35.55)","Avene Thermal Spring Water Spray 50ml (29.00)"] | ["The Ordinary Glycolic Acid 7% Toning Solution 240ml (39.90)","Mielle Rosemary Mint Scalp & Hair Strengthening Oil 2oz (28.35)","Cerave Foaming Facial Cleanser 473ml (57.70)","Some By Mi Retinol Intense Advanced Triple Action Eye Cream 30ml (35.55)","Avene Thermal Spring Water Spray 50ml (29.00)"]	image	t	{photos/photo_651@24-02-2026_14-45-27.jpg,files/invoice-12858616.pdf}	2026-02-27 17:48:58.622	2026-02-27 19:48:56.506	\N	default_farnoosh_mashreq	\N
message1073	2026-02-24 00:00:00	15:09	17.50	AED	expense	cmm56s17e00068ogeybi889nb	Home Centre (via Tabby)	\N	["Tabby installment 2 of 4 for plates and mop from Home Centre - payment schedule detail (total 70) - AED 17.5"]	image	t	{photos/photo_662@24-02-2026_15-09-18.jpg}	2026-02-27 17:48:58.622	2026-02-27 19:47:56.174	message1072	default_farnoosh_mashreq	\N
message1071	2026-02-24 00:00:00	15:09	61.69	AED	expense	cmm56s17e00068ogeybi889nb	Amazon.ae (via Tabby)	\N	["Tabby installment 2 of 4 for chandelier and wall clock from Amazon - payment schedule detail (total 246.78) - AED 61.69"]	image	t	{photos/photo_660@24-02-2026_15-09-03.jpg}	2026-02-27 17:48:58.622	2026-02-27 19:48:33.188	message1070	default_farnoosh_mashreq	\N
message1012	2026-02-02 00:00:00	00:22	127.52	AED	expense	cmm56s17f00078oge3yf8pp6g	Platinumlist	قسط اول تبی tabby برای بلیت پالم جمیرا با فریدینا	["Palm Jumeira ticket (Tabby installment 1 of 3)"] | ["Palm Jumeira ticket (Tabby payment schedule, total 382.48)"] | ["Palm Jumeira ticket (Tabby payment schedule, total 382.48)"]	image	t	{photos/photo_611@02-02-2026_00-22-31.jpg,photos/photo_612@02-02-2026_00-22-31.jpg}	2026-02-27 17:48:58.622	2026-02-27 19:49:41.082	\N	default_farnoosh_mashreq	\N
message1067	2026-02-24 00:00:00	15:03	218.00	AED	expense	cmm56s17800028ogefz2eqqt0	Seyed Kazem Mirjalili	سید کاظم میرجلیلی	["Food/restaurant purchase - AED 218.0"]	image	t	{photos/photo_658@24-02-2026_15-03-27.jpg}	2026-02-27 17:48:58.622	2026-02-27 20:20:13.97	\N	default_farnoosh_mashreq	\N
message1057	2026-02-24 00:00:00	14:47	190.50	AED	expense	cmm56s17j000a8ogezifv1oi1	Life Pharmacy	\N	["The Ordinary Glycolic Acid 7% Toning Solution 240ml (39.90)","Mielle Rosemary Mint Scalp & Hair Strengthening Oil 2oz (28.35)","Cerave Foaming Facial Cleanser 473ml (57.70)","Some By Mi Retinol Intense Advanced Triple Action Eye Cream 30ml (35.55)","Avene Thermal Spring Water Spray 50ml (29.00)"]	file	t	{files/invoice-12858616.pdf}	2026-02-27 17:48:58.622	2026-02-27 19:48:56.506	message1056	default_farnoosh_mashreq	\N
message1013	2026-02-02 00:00:00	00:22	127.52	AED	expense	cmm56s17f00078oge3yf8pp6g	Platinumlist	\N	["Palm Jumeira ticket (Tabby payment schedule, total 382.48)"]	image	t	{photos/photo_612@02-02-2026_00-22-31.jpg}	2026-02-27 17:48:58.622	2026-02-27 19:49:41.082	message1012	default_farnoosh_mashreq	\N
message991	2026-01-29 00:00:00	00:06	70.00	AED	expense	cmm56s17c00058ogea78vq636	Home Centre	\N	["Quiki-Kleen 2-in-1 wet and dry spray mop 36","Essential dinner plate 27cm x2 8","shipping 18"]	image	t	{photos/photo_592@29-01-2026_00-06-08.jpg}	2026-02-27 17:48:58.553	2026-02-27 19:50:20.033	message992	default_farnoosh_mashreq	\N
message966	2026-01-26 00:00:00	20:11	18.83	AED	expense	cmm56s17a00048ogeacrpia4x	Sobha Smart Bill Services	قبضDecemberبابتchilled and hot water | رسید پرداختDecember billبابتchilled and hot water	["December chilled and hot water bill - Thermal Energy 18.87, Hot Water 0.00, Other Charges (billing service fee) 26.25, minus adjustments"] | ["Payment receipt for December chilled and hot water bill to Sobha Smart Bill Services LLC via bank transfer"]	file	t	{files/SSBS-D-344520.pdf,files/MLC2501261639124.PDF}	2026-02-27 17:48:58.553	2026-02-27 19:51:17.497	\N	default_farnoosh_mashreq	\N
message967	2026-01-26 00:00:00	20:11	18.83	AED	transfer	cmm56s17a00048ogeacrpia4x	Sobha Smart Bill Services	رسید پرداختDecember billبابتchilled and hot water	["Payment receipt for December chilled and hot water bill to Sobha Smart Bill Services LLC via bank transfer"]	file	t	{files/MLC2501261639124.PDF}	2026-02-27 17:48:58.553	2026-02-27 19:51:17.497	message966	default_farnoosh_mashreq	\N
message956	2026-01-26 00:00:00	19:56	1226.75	AED	expense	cmm56s17c00058ogea78vq636	Amazon.ae (via Tabby)	\N	["Farnoosh phone - Tabby pay-in-4 schedule (total 4907.00). Installment 2 of 4 paid 24 Jan"]	image	t	{photos/photo_578@26-01-2026_19-56-20.jpg}	2026-02-27 17:48:58.553	2026-02-27 19:51:53.742	message955	default_farnoosh_mashreq	\N
message901	2026-01-08 00:00:00	16:06	153.45	AED	expense	cmm56s17800028ogefz2eqqt0	Choithrams	\N	["Shopping bag","Sweet potato","Beetroot","Bertolli extra virgin olive oil 750ml","Nectarine South Africa","Banana Chiquita Ecuador","Kiwi New Zealand","Tomato local pack of 6","Glad aluminium foil 200 sq ft","Al Jazira eggs white family pack 15s","Nescafe 2in1 30x11.7g sugar free"]	image	t	{photos/photo_541@08-01-2026_16-06-54.jpg}	2026-02-27 17:48:58.553	2026-02-27 19:53:40.704	message902	default_farnoosh_mashreq	\N
message839	2025-12-25 00:00:00	21:34	515.84	AED	expense	cmm56s17a00048ogeacrpia4x	DEWA	قبض دیواDewa | رسید پرداخت قبض دیواDewa	["Electricity (AED 61.89)","Water (AED 105.61)","Housing fee (AED 312.50)","Sewerage (AED 35.84)"] | ["DEWA bill payment receipt (duplicate of bill)"]	file	t	{"files/Bill (8).pdf","files/Receipt (8).pdf"}	2026-02-27 17:48:58.48	2026-02-27 19:54:20.203	\N	default_farnoosh_mashreq	\N
message840	2025-12-25 00:00:00	21:34	515.84	AED	expense	cmm56s17a00048ogeacrpia4x	DEWA	رسید پرداخت قبض دیواDewa	["DEWA bill payment receipt (duplicate of bill)"]	file	t	{"files/Receipt (8).pdf"}	2026-02-27 17:48:58.48	2026-02-27 19:54:20.203	message839	default_farnoosh_mashreq	\N
message816	2025-12-18 00:00:00	18:16	75.00	AED	expense	cmm56s17g00088oge05l6cktv	Max Fashion	خرید ژاکت قرمز فرنوش از فروشگاه مکسپولش باید برگرده | خرید ژاکت قرمز فرنوش از فروشگاه مکس	Red jacket for Farnoosh (online) | Red jacket for Farnoosh	image	t	{photos/photo_478@18-12-2025_18-16-48.jpg,photos/photo_482@18-12-2025_18-23-20.jpg}	2026-02-27 17:48:58.48	2026-02-27 19:55:27.055	\N	default_farnoosh_mashreq	\N
message820	2025-12-18 00:00:00	18:23	75.00	AED	expense	cmm56s17g00088oge05l6cktv	Max Fashion	خرید ژاکت قرمز فرنوش از فروشگاه مکس	Red jacket for Farnoosh	image	t	{photos/photo_482@18-12-2025_18-23-20.jpg}	2026-02-27 17:48:58.48	2026-02-27 19:55:27.055	message816	default_farnoosh_mashreq	\N
message788	2025-12-06 00:00:00	23:00	220.00	AED	expense	cmm56s17800028ogefz2eqqt0	Seyed Kazem Mirjalili General Trading LLC	سید کاظم میر جلیلی	["Haraz Greek Yoghurt 750g (12.00)","Mandarin Shomal kg (16.65)","Lettuce Romaine kg (3.60)","Onion White kg (6.07)","Cucumber kg (4.20)","Capsicum Green kg (5.85)","Potato Iri kg (6.84)","Strawberry 250g (12.00)","Beetroot RSA (24.20)","Tomato Irani Bunch kg (3.89)","Sahar Green Olives Pickle 640g (3.89)","Pamchal Cucumber Pickle (15.00)","Carrot Irani kg (2.00)","Haraz Feta Cheese 300g (4.14)","Sweet Tamarind 450g (10.00)","Kalleh Doogh 1.5L (10.00)","Nectarine kg (12.00)","Persimmon Iri kg (12.31)","Hoobara Coconut Bar (15.00)","Hoobara Pistachio & Cheese (10.00)","Hoobara Orange & Mint (10.00)"] | ["Groceries (page 2 of invoice, NET AFTER VAT 220.00 AED)"]	image	t	{photos/photo_458@06-12-2025_23-00-27.jpg,photos/photo_459@06-12-2025_23-00-27.jpg}	2026-02-27 17:48:58.48	2026-02-27 19:55:48.58	\N	default_farnoosh_mashreq	\N
message789	2025-12-06 00:00:00	23:00	220.00	AED	expense	cmm56s17800028ogefz2eqqt0	Seyed Kazem Mirjalili General Trading LLC	سید کاظم میر جلیلی	["Groceries (page 2 of invoice, NET AFTER VAT 220.00 AED)"]	image	t	{photos/photo_459@06-12-2025_23-00-27.jpg}	2026-02-27 17:48:58.48	2026-02-27 19:55:48.58	message788	default_farnoosh_mashreq	\N
message758	2025-11-27 00:00:00	10:52	489.98	AED	expense	cmm56s17a00048ogeacrpia4x	DEWA	رسید پرداخت قبض دیواDewa | هشتمین قبض دیواDewa	["DEWA bill payment receipt"] | ["Electricity (61.89 AED)","Water (86.55 AED)","Housing fee (312.50 AED)","Sewerage (29.04 AED)"]	file	t	{"files/Receipt (7).pdf","files/Bill (7).pdf"}	2026-02-27 17:48:58.411	2026-02-27 19:57:07.056	\N	default_farnoosh_mashreq	\N
message757	2025-11-27 00:00:00	10:52	489.98	AED	expense	cmm56s17a00048ogeacrpia4x	DEWA	هشتمین قبض دیواDewa	["Electricity (61.89 AED)","Water (86.55 AED)","Housing fee (312.50 AED)","Sewerage (29.04 AED)"]	file	t	{"files/Bill (7).pdf"}	2026-02-27 17:48:58.411	2026-02-27 19:57:07.056	message758	default_farnoosh_mashreq	\N
message502	2025-08-28 00:00:00	19:44	35.00	AED	expense	cmm56s17900038ogeyynewip3	Cars Taxi	تاکسی از بلهاسا به خونه - امتحان yard assessment test	["Apple Pay card transaction at Cars Taxi, Dubai"]	image	t	{photos/photo_263@28-08-2025_19-44-01.jpg}	2026-02-27 17:48:58.278	2026-02-28 08:48:27.913	message501	default_farnoosh_mashreq	\N
message724	2025-11-21 00:00:00	09:50	30.00	AED	expense	cmm56s17e00068ogeybi889nb	Home Box LLC	\N	["Cabinet organizer items (Oasis Centre)"]	image	t	{photos/photo_411@21-11-2025_09-50-28.jpg}	2026-02-27 17:48:58.411	2026-02-27 19:59:21.532	message725	default_farnoosh_mashreq	\N
message695	2025-11-09 00:00:00	12:24	3853.38	AED	expense	cmm56s17e00068ogeybi889nb	Spotahome	\N	Same Spotahome rent transaction as message694 (app screenshot)	image	t	{photos/photo_389@09-11-2025_12-24-08.jpg}	2026-02-27 17:48:58.411	2026-02-27 20:01:34.161	message694	default_farnoosh_mashreq	\N
message657	2025-10-27 00:00:00	16:02	416.12	AED	expense	cmm56s17a00048ogeacrpia4x	DEWA	هفتمین قبض دیواDewa | رسید پرداخت قبض دیواDewa	["Electricity 43.31","Water 45.82","Housing fee 312.50","Sewerage 14.49","VAT 4.24"] | ["DEWA bill payment via Apple Pay"]	file	t	{"files/Bill (6).pdf","files/Receipt (6).pdf"}	2026-02-27 17:48:58.411	2026-02-27 20:01:44.423	\N	default_farnoosh_mashreq	\N
message658	2025-10-27 00:00:00	16:02	416.12	AED	expense	cmm56s17a00048ogeacrpia4x	DEWA	رسید پرداخت قبض دیواDewa	["DEWA bill payment via Apple Pay"]	file	t	{"files/Receipt (6).pdf"}	2026-02-27 17:48:58.411	2026-02-27 20:01:44.423	message657	default_farnoosh_mashreq	\N
message601	2025-09-25 00:00:00	13:18	553.23	AED	expense	cmm56s17a00048ogeacrpia4x	DEWA	ششمین قبض دیواDewa | رسید پرداخت قبض دیواDewa	["Electricity - AED 90.21","Water - AED 112.29","Housing fee - AED 312.50","Sewerage - AED 38.23"] | ["DEWA bill payment via Apple Pay"]	file	t	{"files/Bill (5).pdf","files/Receipt (5).pdf"}	2026-02-27 17:48:58.342	2026-02-27 20:01:56.048	\N	default_farnoosh_mashreq	\N
message602	2025-09-25 00:00:00	13:18	553.23	AED	expense	cmm56s17a00048ogeacrpia4x	DEWA	رسید پرداخت قبض دیواDewa	["DEWA bill payment via Apple Pay"]	file	t	{"files/Receipt (5).pdf"}	2026-02-27 17:48:58.342	2026-02-27 20:01:56.048	message601	default_farnoosh_mashreq	\N
message528	2025-09-06 00:00:00	18:24	60.00	AED	expense	cmm56s17a00048ogeacrpia4x	Arabian Unigaz	پرداخت اولین قبض گاز	["First gas bill payment - LPG 3.250 m3, Total inc VAT 60.007, paid via Visa debit card at Network terminal"] | ["LPG Gas - 3.250 m3 @ 7.50 = 24.375","Service Charge - 4.370 @ 7.50 = 32.775","VAT - 2.857"]	image	t	{photos/photo_276@06-09-2025_18-24-42.jpg,files/InvoiceRef107376.pdf}	2026-02-27 17:48:58.278	2026-02-27 20:02:49.409	\N	default_farnoosh_mashreq	\N
message527	2025-09-06 00:00:00	18:24	60.00	AED	expense	cmm56s17a00048ogeacrpia4x	Arabian Unigaz	پرداخت اولین قبض گاز	["LPG Gas - 3.250 m3 @ 7.50 = 24.375","Service Charge - 4.370 @ 7.50 = 32.775","VAT - 2.857"]	file	t	{files/InvoiceRef107376.pdf}	2026-02-27 17:48:58.278	2026-02-27 20:02:49.409	message528	default_farnoosh_mashreq	\N
message492	2025-08-26 00:00:00	18:07	540.99	AED	expense	cmm56s17a00048ogeacrpia4x	DEWA	پنجمین قبض دیواDewa | رسید پرداخت قبض دیواDewa	["Electricity: 89.60","Water: 103.72","Housing fee: 312.50","Sewerage: 35.17","VAT: 9.21"] | ["DEWA bill payment via Apple Pay"]	file	t	{"files/Bill (4).pdf","files/Receipt (4).pdf"}	2026-02-27 17:48:58.278	2026-02-27 20:02:55.095	\N	default_farnoosh_mashreq	\N
message493	2025-08-26 00:00:00	18:07	540.99	AED	expense	cmm56s17a00048ogeacrpia4x	DEWA	رسید پرداخت قبض دیواDewa	["DEWA bill payment via Apple Pay"]	file	t	{"files/Receipt (4).pdf"}	2026-02-27 17:48:58.278	2026-02-27 20:02:55.095	message492	default_farnoosh_mashreq	\N
message405	2025-07-26 00:00:00	14:26	422.56	AED	expense	cmm56s17a00048ogeacrpia4x	DEWA (Dubai Electricity & Water Authority)	چهارمین قبض دیواDewa | رسید پرداخت قبض دیواDewa	\N	file	t	{"files/Bill (3).pdf","files/Receipt (3).pdf"}	2026-02-27 17:48:58.208	2026-02-27 20:03:19.167	\N	default_farnoosh_mashreq	\N
message406	2025-07-26 00:00:00	14:26	422.56	AED	expense	cmm56s17a00048ogeacrpia4x	DEWA (Dubai Electricity & Water Authority)	رسید پرداخت قبض دیواDewa	\N	file	t	{"files/Receipt (3).pdf"}	2026-02-27 17:48:58.208	2026-02-27 20:03:19.167	message405	default_farnoosh_mashreq	\N
message384	2025-07-15 00:00:00	14:49	50.00	AED	expense	cmm56s17a00048ogeacrpia4x	du	\N	["DU mobile recharge confirmation - 50 AED to 971525662144"]	image	t	{photos/photo_187@15-07-2025_14-49-45.jpg}	2026-02-27 17:48:58.208	2026-02-27 20:03:30.613	message383	default_farnoosh_mashreq	\N
message351	2025-07-06 00:00:00	13:08	372.71	AED	expense	cmm56s17a00048ogeacrpia4x	DEWA	سومین قبض دیواDewa | رسید پرداخت قبض دیواDewa	["DEWA bill June 2025: Electricity 32.49, Water 24.69, Housing fee 312.50, Sewerage 3.03, VAT 2.73"] | ["DEWA bill payment receipt, paid via Apple Pay on 04/07/2025"] | ["DEWA payment confirmation via Mashreq Visa Debit Platinum Card on 7/4/25"]	file	t	{"files/Bill (2).pdf","files/Receipt (2).pdf",photos/photo_174@06-07-2025_13-09-59.jpg}	2026-02-27 17:48:58.208	2026-02-27 20:03:58.191	\N	default_farnoosh_mashreq	\N
message352	2025-07-06 00:00:00	13:08	372.71	AED	expense	cmm56s17a00048ogeacrpia4x	DEWA	رسید پرداخت قبض دیواDewa	["DEWA bill payment receipt, paid via Apple Pay on 04/07/2025"]	file	t	{"files/Receipt (2).pdf"}	2026-02-27 17:48:58.208	2026-02-27 20:03:58.191	message351	default_farnoosh_mashreq	\N
message353	2025-07-06 00:00:00	13:09	372.71	AED	expense	cmm56s17a00048ogeacrpia4x	DEWA	\N	["DEWA payment confirmation via Mashreq Visa Debit Platinum Card on 7/4/25"]	image	t	{photos/photo_174@06-07-2025_13-09-59.jpg}	2026-02-27 17:48:58.208	2026-02-27 20:03:58.191	message351	default_farnoosh_mashreq	\N
message725	2025-11-21 00:00:00	09:50	30.00	AED	expense	cmm5cqzf10001pw01d9pekwf0	Home Box LLC	داخل کابینتی سفیدداخل کشوی مهمان طوسیاز homebox	["Transparent Anti Slip Drawer Mat 50x150 cm - White","Chequre Basket 33x12cm - Grey"] | ["Cabinet organizer items (Oasis Centre)"]	image	t	{photos/photo_412@21-11-2025_09-50-29.jpg,photos/photo_411@21-11-2025_09-50-28.jpg}	2026-02-27 17:48:58.411	2026-02-28 09:15:58.755	\N	default_farnoosh_mashreq	\N
message343	2025-07-06 00:00:00	12:50	482.65	AED	expense	cmm56s17a00048ogeacrpia4x	DEWA	\N	["DEWA payment confirmation via Mashreq Visa Debit Platinum Card on 6/7/25"]	image	t	{photos/photo_173@06-07-2025_12-50-58.jpg}	2026-02-27 17:48:58.208	2026-02-27 20:04:43.204	message341	default_farnoosh_mashreq	\N
message320	2025-05-20 00:00:00	02:41	27.50	AED	expense	cmm56s17900038ogeyynewip3	Zed (Taxi)	\N	\N	image	t	{photos/photo_163@20-05-2025_02-41-40.jpg}	2026-02-27 17:48:58.208	2026-02-27 20:05:18.444	message319	default_farnoosh_mashreq	\N
message333	2025-05-20 00:00:00	10:41	38.00	AED	expense	cmm56s17900038ogeyynewip3	Zed (Dubai Taxi)	\N	["Taxi from Sobha Creek Vistas Reserve to Airport Terminal 1 Dubai (same journey as photo_170, showing payment total)"]	image	t	{photos/photo_171@20-05-2025_10-41-12.jpg}	2026-02-27 17:48:58.208	2026-02-27 20:05:26.006	message332	default_farnoosh_mashreq	\N
message694	2025-11-09 00:00:00	12:22	3853.38	AED	transfer	cmm56s17i00098oge2xb5or4t	Spotahome	پول اجاره خونه داداش ونوس	Rent via Spotahome (EUR 880 converted) | Same Spotahome rent transaction as message694 (app screenshot)	file	t	{"files/Transaction Confirmation on Mashreq Card.pdf",photos/photo_389@09-11-2025_12-24-08.jpg}	2026-02-27 17:48:58.411	2026-02-28 15:56:46.228	\N	default_farnoosh_mashreq	\N
message280	2025-05-04 00:00:00	12:13	425.71	AED	expense	cmm56s17f00078oge3yf8pp6g	Amazon.ae (via Tabby)	\N	["Tabby payment confirmation - PS5 installment 3 of 4"]	file	t	{files/Gmail_Thanks!_Here’s_your_tabby_payment_confirmation_.pdf}	2026-02-27 17:48:58.208	2026-02-27 20:05:33.542	message278	default_farnoosh_mashreq	\N
message286	2025-05-04 00:00:00	12:17	459.66	AED	expense	cmm56s17a00048ogeacrpia4x	DEWA	اولین قبض دیواDewa	["DEWA bill payment - Apple Wallet confirmation"]	image	t	{photos/photo_145@04-05-2025_12-17-27.jpg}	2026-02-27 17:48:58.208	2026-02-27 20:05:43.831	message285	default_farnoosh_mashreq	\N
message272	2025-04-26 00:00:00	15:47	50.00	AED	expense	cmm56s17a00048ogeacrpia4x	du	شارژ حساب du خودم	["du mobile recharge (971525662144) - Apple Wallet confirmation"]	image	t	{photos/photo_139@26-04-2025_15-47-17.jpg}	2026-02-27 17:48:58.208	2026-02-27 20:06:02.512	message271	default_farnoosh_mashreq	\N
message235	2025-04-13 00:00:00	11:47	80.00	AED	expense	cmm56s17a00048ogeacrpia4x	du	اینترنت سینا ماه آپریل	["Internet recharge - Sina - April"] | ["Internet recharge confirmation email"]	file	t	{"files/2025-04-13 11.46.43.jpg","files/Gmail - Successful recharge (2).pdf"}	2026-02-27 17:48:58.128	2026-02-27 20:06:11.283	\N	default_farnoosh_mashreq	\N
message236	2025-04-13 00:00:00	11:47	80.00	AED	expense	cmm56s17a00048ogeacrpia4x	du	\N	["Internet recharge confirmation email"]	file	t	{"files/Gmail - Successful recharge (2).pdf"}	2026-02-27 17:48:58.128	2026-02-27 20:06:11.283	message235	default_farnoosh_mashreq	\N
message224	2025-03-28 00:00:00	18:31	1702.85	AED	expense	cmm56s17f00078oge3yf8pp6g	Tabby (Amazon.ae)	\N	["Order total: AED 1,702.85","Amount paid to date: AED 851.42","Amount remaining: AED 851.43"]	image	t	{photos/photo_117@28-03-2025_18-31-58.jpg}	2026-02-27 17:48:58.128	2026-02-27 20:06:26.167	message223	default_farnoosh_mashreq	\N
message211	2025-03-26 00:00:00	19:23	1800.00	AED	expense	cmm56s17e00068ogeybi889nb	Stay by Latinem	تمدید ۴ شب خونه‌ی Sobha Waves	["Accommodation confirmation - 4 nights, 2 guests, non-refundable"] | ["Accommodation - Sina Ghadri x 1 (4 nights)"]	file	t	{"files/Confirmation Letter - Mr. Sina Ghadri.pdf","files/Gmail - Your Stay by Latinem receipt [#1006-7714].pdf"}	2026-02-27 17:48:58.128	2026-02-27 20:06:44.542	\N	default_farnoosh_mashreq	\N
message210	2025-03-26 00:00:00	19:23	1800.00	AED	expense	cmm56s17e00068ogeybi889nb	Stay by Latinem	تمدید ۴ شب خونه‌ی Sobha Waves	["Accommodation - Sina Ghadri x 1 (4 nights)"]	file	t	{"files/Gmail - Your Stay by Latinem receipt [#1006-7714].pdf"}	2026-02-27 17:48:58.128	2026-02-27 20:06:44.542	message211	default_farnoosh_mashreq	\N
message148	2025-03-16 00:00:00	11:45	50.00	AED	expense	cmm56s17a00048ogeacrpia4x	du	شارژ خط سینا	Mobile phone top-up recharge	image	t	{photos/photo_81@16-03-2025_11-45-41.jpg,"files/Gmail - Successful recharge (1).pdf"}	2026-02-27 17:48:58.128	2026-02-27 20:08:52.434	\N	default_farnoosh_mashreq	\N
message149	2025-03-16 00:00:00	11:45	50.00	AED	expense	cmm56s17a00048ogeacrpia4x	du	\N	Mobile phone top-up recharge	file	t	{"files/Gmail - Successful recharge (1).pdf"}	2026-02-27 17:48:58.128	2026-02-27 20:08:52.434	message148	default_farnoosh_mashreq	\N
message145	2025-03-16 00:00:00	11:40	1702.85	AED	expense	cmm56s17c00058ogea78vq636	Amazon.ae	\N	\N	image	t	{photos/photo_80@16-03-2025_11-40-47.jpg}	2026-02-27 17:48:58.128	2026-02-27 20:09:34.535	message144	default_farnoosh_mashreq	\N
message88	2024-12-24 00:00:00	15:17	90.00	AED	expense	cmm56s17a00048ogeacrpia4x	du	\N	Mobile recharge AED 90	file	t	{"files/Gmail - Successful recharge.pdf"}	2026-02-27 17:48:58.031	2026-02-27 20:09:45.698	message80	default_farnoosh_mashreq	\N
cmm6fdwd800128o1slycb3wvj	2025-04-26 00:00:00	16:15	58.00	AED	expense	cmm56s17600018ogeqghk7vfb	Food Bazaar	غذا از Food Bazaar	\N	image	t	{media-sina/photos/photo_8@26-04-2025_16-15-26.jpg}	2026-02-28 14:37:41.277	2026-02-28 15:09:40.471	\N	cmm6fbnk800008o9w89ze2ol6	\N
message46	2024-12-01 00:00:00	14:45	370.00	AED	transfer	cmm56s17c00058ogea78vq636	IPP Transfer to Esmaeil Darvish Khojasteh (via Mashreq/BOML)	کارت به کارت برای جناحی	["IPP bank transfer, ref: 033IPPD24331A7ME (transaction list view of same transfer as photo_27)"]	image	t	{photos/photo_28@01-12-2024_14-45-31.jpg}	2026-02-27 17:48:58.031	2026-02-27 20:10:08.657	message45	default_farnoosh_mashreq	\N
message903	2026-01-08 00:00:00	16:08	197.00	AED	expense	cmm56s17800028ogefz2eqqt0	Seyed Kazem Mirjalili	سید کاظم میر جلیلی	\N	image	t	{photos/photo_543@08-01-2026_16-08-17.jpg}	2026-02-27 17:48:58.553	2026-02-27 20:28:50.82	\N	default_farnoosh_mashreq	\N
message11	2024-11-02 00:00:00	22:05	41.60	AED	expense	cmm56s17f00078oge3yf8pp6g	Uber	اجاره اسکوتر از اوبر uber	Uber scooter rental, Business Bay to Marasi Dr	file	t	{files/Receipt_02Nov2024_171221.pdf}	2026-02-27 17:48:58.031	2026-02-27 20:48:32.399	\N	default_farnoosh_mashreq	\N
message71	2024-12-18 00:00:00	18:36	63.42	AED	expense	cmm56s17800028ogefz2eqqt0	Day to Day (Burjuman Signal, near Metro Station)	دی تو دی	["Water pump - 8.99","Bshri1 Basin 11+R - 5.99","Amo889 Steel Boya N - 10.99","Super Strike Kill I - 11.99","Top hand wash 500ml - 2.99","Oral-B Mouthwash - 7.99","Crunchy Penut Butte - 4.99","Bijan Tomato Paste - 5.50","Limonade Carbonated - 3.99"]	image	t	{photos/photo_43@18-12-2024_18-36-02.jpg}	2026-02-27 17:48:58.031	2026-02-27 20:55:16.397	\N	default_farnoosh_mashreq	\N
message641	2025-10-19 00:00:00	11:28	482.00	AED	expense	cmm56s17f00078oge3yf8pp6g	Mashreq Bank Transfer	موزه مادام توسوو شام با نگین اینا	["fund transfer to Negin Aliasghar Bahrami - Family Support (Madame Tussauds evening)"]	file	t	{files/MLC1910250147323.PDF}	2026-02-27 17:48:58.342	2026-02-27 21:00:55.743	\N	default_farnoosh_mashreq	\N
message563	2025-09-15 00:00:00	11:51	160.00	AED	expense	cmm56s17600018ogeqghk7vfb	Mashreq NEO	خوراکی و شام در جشن ایرانیان	["Fund transfer to Negin Aliasghar Bahrami at Al Maryah Community Bank for family support (food/dinner at Iranian celebration)"]	file	t	{files/MLC1409251424838.PDF}	2026-02-27 17:48:58.342	2026-02-27 21:01:12.292	\N	default_farnoosh_mashreq	\N
message45	2024-12-01 00:00:00	14:45	370.00	AED	expense	cmm5ckzhy0000pw01vktsd04i	IPP Transfer to Esmaeil Darvish Khojasteh (via Mashreq/BOML)	کارت به کارت برای جناحی	["IPP bank transfer, ref: 033IPPD24331A7ME, personal/cultural/audiovisual and recreational services"] | ["IPP bank transfer, ref: 033IPPD24331A7ME (transaction list view of same transfer as photo_27)"]	image	t	{photos/photo_27@01-12-2024_14-45-31.jpg,photos/photo_28@01-12-2024_14-45-31.jpg}	2026-02-27 17:48:58.031	2026-02-27 21:01:52.189	\N	default_farnoosh_mashreq	\N
message80	2024-12-24 00:00:00	11:24	90.00	AED	expense	cmm56s17a00048ogeacrpia4x	du	خرید اینترنت دو سینا	Mobile recharge AED 90	image	t	{photos/photo_49@24-12-2024_11-24-25.jpg,"files/Gmail - Successful recharge.pdf"}	2026-02-27 17:48:58.031	2026-02-28 07:40:41.815	\N	default_farnoosh_mashreq	\N
message144	2025-03-16 00:00:00	11:40	425.71	AED	expense	cmm5cqzf10001pw01d9pekwf0	Amazon.ae	خرید از آمازونپرداخت با Tabby	\N	image	t	{photos/photo_79@16-03-2025_11-40-47.jpg,photos/photo_80@16-03-2025_11-40-47.jpg}	2026-02-27 17:48:58.128	2026-02-28 08:06:55.221	\N	default_farnoosh_mashreq	\N
message278	2025-05-04 00:00:00	12:11	425.71	AED	expense	cmm5cqzf10001pw01d9pekwf0	Amazon.ae (via Tabby)	قسط سوم ps با tabby	["PS5 installment 3 of 4 (total order AED 1,702.85)"] | ["Tabby payment confirmation - PS5 installment 3 of 4"]	image	t	{photos/photo_142@04-05-2025_12-11-24.jpg,files/Gmail_Thanks!_Here’s_your_tabby_payment_confirmation_.pdf}	2026-02-27 17:48:58.208	2026-02-28 08:23:16.796	message279	default_farnoosh_mashreq	\N
message256	2025-04-13 00:00:00	12:47	401.00	AED	expense	cmm56s17600018ogeqghk7vfb	Mashreq Bank (Fund Transfer)	کارت به کارت به نگین بابت AYA و ریواس	["Bank transfer to Negin Aliasghar Bahrami - AYA Universe and Rivas expenses","Beneficiary bank: Al Maryah Community Bank","Purpose: Family Support"]	file	t	{files/WLC1304251180008.pdf}	2026-02-27 17:48:58.128	2026-02-27 21:01:36.956	\N	default_farnoosh_mashreq	\N
message547	2025-09-08 00:00:00	12:19	2355.00	AED	expense	cmm56s17f00078oge3yf8pp6g	Mashreq NEO	ورودی موزه خطای دید ۱۶۰ درهمشام خودمونی ۱۹۴ درهمبرای حساب شرکت ۲۰۰۰ درهمکارمزد ۱ درهم	["Fund transfer to Negin Aliasghar Bahrami at Al Maryah Community Bank for family support"]	file	t	{files/MLC0809251144398.PDF}	2026-02-27 17:48:58.342	2026-02-28 07:11:23.013	\N	default_farnoosh_mashreq	\N
message262	2025-04-19 00:00:00	15:40	\N	AED	income	cmm56s17i00098oge2xb5or4t	Mashreq Neo	کارت به کارت سینا به فرنوش	\N	text	f	{}	2026-02-27 17:48:58.128	2026-02-28 07:18:18.559	message261	default_farnoosh_mashreq	\N
message27	2024-11-09 00:00:00	19:37	11.00	AED	expense	cmm56s17600018ogeqghk7vfb	KFC - Circle Mall (Kuwait Food Co. Americana LLC)	\N	["7Up Medium"]	image	t	{photos/photo_15@09-11-2024_19-37-06.jpg}	2026-02-27 17:48:58.031	2026-02-28 07:30:12.699	message28	default_farnoosh_mashreq	\N
message136	2025-03-16 00:00:00	11:27	132.00	AED	expense	cmm56s17600018ogeqghk7vfb	Iran Zamin (via Talabat)	\N	["Joojeh Kebab Masti Sandwich - 71.00","Chicken Schnitzel Sandwich - 83.00","Discount - -30.80","Delivery fee - 4.90","Service fee - 3.90"]	image	t	{photos/photo_73@16-03-2025_11-27-27.jpg}	2026-02-27 17:48:58.031	2026-02-28 08:04:55.418	message137	default_farnoosh_mashreq	\N
message185	2025-03-23 00:00:00	11:48	690.57	AED	expense	cmm56s17800028ogefz2eqqt0	Fresh Bazaar Supermarket (Jumeirah, Dubai)	خرید از Fresh Bazaar	["Shopping Paper Bags","Tiffany Strawberry Weffers 76g","Tiffany Chocolate Weffers 65g","Al Arz Samoon","Maz Maz Super Chips 55g","Potato Loose Lebanon","Maz Maz Popcorn Salted 60g","Cabbage Red Clean (Iran)","Shallot Yogurt 200g","Mushroom Oman","Colgate Toothbrush Zigzag Flex Med","Shiba Winter Ice Cream x4","Carrot (Australia)","Bijan Tomato Ketchup 550g","Bijan Raspberry Jam 290g","Bandar Abbas Fish Tuna","Onion White","Bijan Curd Liquid Jar 500ml","Capsicum Green","Alalali Fish Tuna Olive Oil 170g","Mahram Italian Dressing 520g","Sangak Konged x2","Mahram Cucumber Pickle Grade1 650g","Baharneshan Mint Distillate 750ml","Willie Cream Cheese 200g","Iranian Yoghurt Drink Yellow","Mahram Tomato Paste Canned 800g","Sanged","Cucumber Iran","Raisins Black","Orange Cara Cara","Hycinth (Sonbol) Flower","Rockmelon Green Iran","Damavad Apple Iran Red","Krikri Cheese Peanut","Samanu w/Almond 250g","Salmon Irani","Garlic Fresh Iran","Kashvin Small Tongue Sweets 250g","Somac","Peeled Broad Beans","Andre Beef Mortadella","Irani Lamb"] | Groceries: fruits, vegetables, dairy, meat, fish, condiments | Duplicate of message186 (same receipt, bottom portion)	image	t	{photos/photo_94@23-03-2025_11-48-02.jpg,photos/photo_95@23-03-2025_11-48-02.jpg,photos/photo_96@23-03-2025_11-48-02.jpg}	2026-02-27 17:48:58.128	2026-02-28 08:09:44.862	\N	default_farnoosh_mashreq	\N
message218	2025-03-27 00:00:00	14:13	116.50	AED	expense	cmm56s17600018ogeqghk7vfb	Noon	سفارش کباب و جوجه از Persian Kebab	["Noon payment AED 116.50"]	image	t	{photos/photo_113@27-03-2025_14-13-26.jpg}	2026-02-27 17:48:58.128	2026-02-28 08:15:44.261	message217	default_farnoosh_mashreq	\N
message219	2025-03-28 00:00:00	11:44	2130.00	AED	expense	cmm56s17a00048ogeacrpia4x	DEWA	DEWA Depositدیپازیت دیوا	DEWA security deposit	file	t	{files/Dubai_Electricity_&amp;_Water_Authority_Payment_Confirmation.pdf}	2026-02-27 17:48:58.128	2026-02-28 08:16:43.004	message220	default_farnoosh_mashreq	\N
message223	2025-03-28 00:00:00	18:31	1702.85	AED	expense	cmm5cqzf10001pw01d9pekwf0	Tabby (Amazon.ae)	\N	["Payment 1: AED 425.71 - Paid 2 Mar","Payment 2: AED 425.71 - Paid 28 Mar","Payment 3: AED 425.71 - Due 2 May","Payment 4: AED 425.72 - Due 2 Jun"] | ["Order total: AED 1,702.85","Amount paid to date: AED 851.42","Amount remaining: AED 851.43"]	image	t	{photos/photo_116@28-03-2025_18-31-58.jpg,photos/photo_117@28-03-2025_18-31-58.jpg}	2026-02-27 17:48:58.128	2026-02-28 08:17:43.102	message222	default_farnoosh_mashreq	\N
message269	2025-04-26 00:00:00	15:46	\N	AED	expense	cmm56s17800028ogefz2eqqt0	\N	خرید از کارفور	\N	text	f	{}	2026-02-27 17:48:58.208	2026-02-28 08:21:45.95	message267	default_farnoosh_mashreq	\N
message337	2025-07-06 00:00:00	12:27	425.72	AED	expense	cmm5cqzf10001pw01d9pekwf0	Tabby (Amazon.ae)	قسط چهارم (آخر) ps با tabby	["PS5 installment 4/4 (final) via Tabby, order total 1702.85, last payment 425.72"] | ["PS5 installment 4/4 (final) via Tabby - Pay in 4 schedule: Mar 425.71, Apr 425.71, May 425.71, Jun 425.72. Order total 1702.85"]	file	t	{"files/Gmail_Thanks!_Here’s_your_tabby_payment_confirmation_ (1).pdf",photos/photo_172@06-07-2025_12-37-39.jpg}	2026-02-27 17:48:58.208	2026-02-28 08:26:25.632	\N	default_farnoosh_mashreq	\N
message408	2025-07-28 00:00:00	15:29	45.50	AED	expense	cmm56s17900038ogeyynewip3	Dubai Taxi Corporation	تاکسی از خونه به ایکیا	\N	image	t	{photos/photo_204@28-07-2025_15-29-21.jpg}	2026-02-27 17:48:58.208	2026-02-28 08:38:13.19	message409	default_farnoosh_mashreq	\N
message424	2025-08-04 00:00:00	15:31	50.50	AED	expense	cmm56s17900038ogeyynewip3	Cars Taxi	تاکسی از خونه به کلاب آریوس شهرام شب‌پره	\N	image	t	{photos/photo_211@04-08-2025_15-31-52.jpg}	2026-02-27 17:48:58.278	2026-02-28 08:40:10.156	message425	default_farnoosh_mashreq	\N
message435	2025-08-06 00:00:00	19:53	45.50	AED	expense	cmm56s17900038ogeyynewip3	National Taxi	\N	["Taxi ride (from home to Consulate General of Iran)"]	image	t	{photos/photo_220@06-08-2025_19-53-24.jpg}	2026-02-27 17:48:58.278	2026-02-28 08:40:51.434	message434	default_farnoosh_mashreq	\N
message437	2025-08-06 00:00:00	19:54	42.50	AED	expense	cmm56s17900038ogeyynewip3	Dubai Taxi Corporation	\N	["Taxi ride (from Iran Consulate to Belhasa Al Qouz)"]	image	t	{photos/photo_222@06-08-2025_19-54-31.jpg}	2026-02-27 17:48:58.278	2026-02-28 08:41:04.713	message436	default_farnoosh_mashreq	\N
message439	2025-08-06 00:00:00	19:55	45.50	AED	expense	cmm56s17900038ogeyynewip3	Cars Taxi	\N	["Taxi ride (from Belhasa Al Qouz to Belhasa Al Wasl)"]	image	t	{photos/photo_224@06-08-2025_19-55-20.jpg}	2026-02-27 17:48:58.278	2026-02-28 08:43:03.011	message438	default_farnoosh_mashreq	\N
message441	2025-08-06 00:00:00	19:57	30.50	AED	expense	cmm56s17900038ogeyynewip3	Hala Taxi	تاکسی از بلهاسا الوصل به خونه	["Taxi ride (10 km, 12 min, from Belhasa Driving Center Al Wasl Jaddaf Branch to Sobha Creek Vistas Reserve)"] | ["Taxi ride (from Belhasa Al Wasl to home)"]	image	t	{photos/photo_225@06-08-2025_19-57-09.jpg,photos/photo_226@06-08-2025_19-57-09.jpg}	2026-02-27 17:48:58.278	2026-02-28 08:43:49.393	\N	default_farnoosh_mashreq	\N
message463	2025-08-19 00:00:00	18:58	27.00	AED	expense	cmm56s17900038ogeyynewip3	Cars Taxi	تاکسی از خونه به بلهاسا - دومین جلسه‌ی عملی	["Taxi ride - Home to Belhasa (card payment via Mashreq Visa) - AED 27.0"]	image	t	{photos/photo_237@19-08-2025_18-58-35.jpg}	2026-02-27 17:48:58.278	2026-02-28 08:45:26.464	message462	default_farnoosh_mashreq	\N
message465	2025-08-19 00:00:00	18:58	30.00	AED	expense	cmm56s17900038ogeyynewip3	Dubai Taxi Corporation	\N	["Taxi ride - Belhasa to Home (card payment via Mashreq Visa) - AED 30.0"]	image	t	{photos/photo_239@19-08-2025_18-58-55.jpg}	2026-02-27 17:48:58.278	2026-02-28 08:46:50.058	message464	default_farnoosh_mashreq	\N
message500	2025-08-28 00:00:00	19:43	31.50	AED	expense	cmm56s17900038ogeyynewip3	Cars Taxi	\N	["Apple Pay card transaction at Cars Taxi, Dubai"]	image	t	{photos/photo_261@28-08-2025_19-43-53.jpg}	2026-02-27 17:48:58.278	2026-02-28 08:48:03.928	message499	default_farnoosh_mashreq	\N
message514	2025-09-02 00:00:00	17:03	27.50	AED	expense	cmm56s17900038ogeyynewip3	CarsTaxi	تاکسی از خونه به بلهاسا - RTA Yard Test	["Taxi ride from home to Belhasa - RTA Yard Test (Apple Wallet / Mashreq Visa Debit confirmation)"]	image	t	{photos/photo_269@02-09-2025_17-03-51.jpg}	2026-02-27 17:48:58.278	2026-02-28 08:49:37.244	message513	default_farnoosh_mashreq	\N
message523	2025-09-06 00:00:00	18:12	31.00	AED	expense	cmm56s17900038ogeyynewip3	Careem	تاکسی از خونه به بلهاسا - امتحان RTA Road Test سینا	["Taxi ride from home to Belhasa - RTA Road Test Sina (Apple Wallet / Mashreq Visa Debit confirmation, 9/3/25)"]	image	t	{photos/photo_274@06-09-2025_18-12-08.jpg}	2026-02-27 17:48:58.278	2026-02-28 08:50:23.048	message522	default_farnoosh_mashreq	\N
message531	2025-09-06 00:00:00	18:33	27.50	AED	expense	cmm56s17900038ogeyynewip3	CarsTaxi	تاکسی از خونه به بلهاسا سینا - جلسه اضافه اول سینا بعد از افتادن در امتحان RTA Road Test	["Taxi ride from home to Belhasa - Sina extra lesson 1 (Apple Wallet / Mashreq Visa Debit confirmation, 9/4/25)"]	image	t	{photos/photo_279@06-09-2025_18-33-37.jpg}	2026-02-27 17:48:58.342	2026-02-28 08:51:39.131	message530	default_farnoosh_mashreq	\N
message543	2025-09-06 00:00:00	19:05	903.44	AED	expense	cmm56s17m000c8ogerjdoev6e	Belhasa Driving Center	پرداخت قسط اول Tabby بابت کلاس رانندگی فرنوش	["Tabby installment schedule for Belhasa Driving Center (4 payments of ~903.44 AED)"] | ["Tabby installment payment (1st of 4) for Belhasa Driving Center, total 3613.75 AED"] | ["Bank confirmation of Tabby charge via Mashreq Visa Debit Platinum Card"]	image	t	{photos/photo_288@06-09-2025_19-05-35.jpg,photos/photo_287@06-09-2025_19-05-35.jpg,photos/photo_289@06-09-2025_19-05-35.jpg}	2026-02-27 17:48:58.342	2026-02-28 08:54:31.455	\N	default_farnoosh_mashreq	\N
message544	2025-09-06 00:00:00	19:05	903.44	AED	expense	cmm56s17m000c8ogerjdoev6e	Tabby	\N	["Bank confirmation of Tabby charge via Mashreq Visa Debit Platinum Card"]	image	t	{photos/photo_289@06-09-2025_19-05-35.jpg}	2026-02-27 17:48:58.342	2026-02-28 08:54:31.455	message543	default_farnoosh_mashreq	\N
message559	2025-09-11 00:00:00	14:36	0.00	AED	expense	cmm56s17m000c8ogerjdoev6e	\N	۱. هزینه‌ی ثبت نام کلاس‌ رانندگی هر نفر3613.75 AED---------------------------------------۲. صدور کارت هر نفر320 AED---------------------------------------۳. رزرو جلسه highway & independent session برای سینا126 AED---------------------------------------۴. رزرو کلاس اضافه‌تر فرنوش برای تمرین پارک و رزرو مجدد امتحان RTA Yard Test419.50 AED---------------------------------------۵. رزرو مجدد امتحان RTA Yard Test فرنوش293.50 AED---------------------------------------۶. رزرو ۲ جلسه اضافه و رزرو مجدد امتحان RTA Road Test سینا797.50 AED---------------------------------------۷. هزینه کل تاکسی‌هامون1176.64 AED---------------------------------------۸. ترجمه گواهینامه‌هامون تو کنسولگری ایران هر دو90 AED---------------------------------------جمع کل:10,770 AED	\N	text	f	{}	2026-02-27 17:48:58.342	2026-02-28 08:56:28.681	\N	default_farnoosh_mashreq	\N
message573	2025-09-20 00:00:00	17:19	50.50	AED	expense	cmm56s17900038ogeyynewip3	Metro Bar - Excelsior Hotel Downtown	تاکسی از خونه به مرکز خرید الغریر	\N	image	t	{photos/photo_304@20-09-2025_17-19-53.jpg}	2026-02-27 17:48:58.342	2026-02-28 08:57:06.69	message572	default_farnoosh_mashreq	\N
message588	2025-09-20 00:00:00	20:55	0.00	AED	expense	cmm56s17c00058ogea78vq636	\N	حساب کتاب سوغاتی:۱. کتونی اسکیچرز بابای سینا ۲۲۹ درهم۲. چای مامان سینا ۸ درهم۳. تافی مامان سینا ۱۲ درهم۴. وازلین مامان سینا ۸.۵۰ درهم۵. وارفارین مامان فرنوش ۶۹.۸۷ درهم ۶. چای مامان فرنوش ۸ درهم۷. تافی مامان فرنوش ۱۲ درهم۸. شامپوها ۶۷.۲۸ درهم۹. باتری ۷۶.۸۸ درهم۱۰. تافی فرزاد ۱۲ درهم۱۱. چای فرزاد ۸ درهمجمعا: ۵۱۲ درهم	\N	text	f	{}	2026-02-27 17:48:58.342	2026-02-28 09:00:24.294	\N	default_farnoosh_mashreq	\N
cmm6fdwdc001k8o1sz2mtk2kn	2025-05-04 00:00:00	12:41	38.00	AED	expense	cmm56s17600018ogeqghk7vfb	McDonald's	نوشیدنی مکدونالد با نگین اینا	\N	image	t	{media-sina/photos/photo_16@04-05-2025_12-41-51.jpg}	2026-02-28 14:37:41.281	2026-02-28 15:06:53.772	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwdb001g8o1str78izi7	2025-05-04 00:00:00	12:39	6.79	AED	expense	cmm56s17800028ogefz2eqqt0	Carrefour	کارفور	\N	image	t	{media-sina/photos/photo_14@04-05-2025_12-39-48.jpg}	2026-02-28 14:37:41.28	2026-02-28 15:07:06.699	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwdb001e8o1sdhsw9to8	2025-05-04 00:00:00	12:38	191.00	AED	expense	cmm56s17600018ogeqghk7vfb	\N	ریواس	\N	image	t	{media-sina/photos/photo_13@04-05-2025_12-38-47.jpg}	2026-02-28 14:37:41.279	2026-02-28 15:07:40.863	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwda001c8o1shabnniql	2025-05-04 00:00:00	12:37	16.00	AED	expense	cmm56s17800028ogefz2eqqt0	\N	تخم مرغ	\N	image	t	{media-sina/photos/photo_12@04-05-2025_12-37-04.jpg}	2026-02-28 14:37:41.279	2026-02-28 15:07:55.074	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwda001a8o1sxe70zqar	2025-05-04 00:00:00	12:36	64.50	AED	expense	cmm56s17900038ogeyynewip3	Token 2049	تاکسی روز دوم از خونه به Token 2049	\N	image	t	{media-sina/photos/photo_11@04-05-2025_12-36-13.jpg}	2026-02-28 14:37:41.278	2026-02-28 15:08:47.7	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwd900188o1smyet96op	2025-05-04 00:00:00	12:34	78.50	AED	expense	cmm56s17900038ogeyynewip3	Token 2049	تاکسی از Token 2049 به خونه	\N	image	t	{media-sina/photos/photo_10@04-05-2025_12-34-54.jpg}	2026-02-28 14:37:41.278	2026-02-28 15:08:58.163	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwd900168o1sgqchvjxs	2025-05-04 00:00:00	12:32	57.00	AED	expense	cmm56s17900038ogeyynewip3	Zed	تاکسی Zed از خونه به Token 2049	\N	image	t	{media-sina/photos/photo_9@04-05-2025_12-32-31.jpg}	2026-02-28 14:37:41.277	2026-02-28 15:09:15.619	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwd900148o1swf5cg5wf	2025-04-27 00:00:00	21:54	168.00	AED	expense	cmm56s17j000a8ogezifv1oi1	\N	۱۶۸ درهم سینا موهاشو کوتاه کرده	\N	\N	f	{}	2026-02-28 14:37:41.277	2026-02-28 15:09:27.338	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwdd001m8o1ssj76cv0t	2025-05-08 00:00:00	09:08	1967.42	AED	transfer	cmm56s17i00098oge2xb5or4t	\N	1967.42 درهم از دانشگاه به حساب سینا واریز شده	\N	\N	f	{}	2026-02-28 14:37:41.281	2026-02-28 15:29:16.146	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwdc001i8o1sf4hm68hp	2025-05-04 00:00:00	12:39	8000.00	AED	income	cmm56s17000008ogezghgfclk	Mashreq ATM	واریز به حساب از طریق دستگاه ATM	\N	image	t	{media-sina/photos/photo_15@04-05-2025_12-39-59.jpg}	2026-02-28 14:37:41.28	2026-02-28 15:29:36.397	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwdf001u8o1se7iem27w	2025-07-04 00:00:00	12:09	5.91	AED	income	cmm56s17000008ogezghgfclk	\N	5.91 درهم سود به حساب سینا واریز شده	\N	\N	f	{}	2026-02-28 14:37:41.283	2026-02-28 14:37:41.283	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwdh00208o1susu3bd1s	2025-07-06 00:00:00	13:47	5000.00	AED	transfer	cmm56s17i00098oge2xb5or4t	\N	کارت به کارت سینا به فرنوش - ۵۰۰۰ درهم	\N	file	t	{media-sina/files/MWM3006252012837.PDF}	2026-02-28 14:37:41.286	2026-02-28 14:37:41.286	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwdj00228o1szzs2p07u	2025-07-06 00:00:00	13:47	8000.00	AED	transfer	cmm56s17i00098oge2xb5or4t	\N	کارت به کارت سینا به فرنوش - ۸۰۰۰ درهم	\N	file	t	{media-sina/files/MWM0607251091190.PDF}	2026-02-28 14:37:41.287	2026-02-28 14:37:41.287	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwdn002a8o1s7xy9cf4z	2025-07-30 00:00:00	12:34	14.14	AED	income	cmm56s17000008ogezghgfclk	\N	14.14 درهم به حساب سینا واریز شده - بابت Funds Transfer	\N	\N	f	{}	2026-02-28 14:37:41.292	2026-02-28 14:37:41.292	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwdr002g8o1sbo5hzymg	2025-08-17 00:00:00	19:58	189.00	AED	expense	cmm56s17600018ogeqghk7vfb	Eataly	۱۸۹ درهم بابت غذا تو رستوران ایتالیایی Eataly با نگین‌ اینا\nمابقی رو برای شرکتمون واریز کردیم	\N	file	t	{media-sina/files/MLC1008251331038.pdf}	2026-02-28 14:37:41.295	2026-02-28 14:37:41.295	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwds002i8o1srqiar40l	2025-08-22 00:00:00	12:23	140.50	AED	expense	cmm56s17600018ogeqghk7vfb	Sirmoni	کباب و جوجه از سیرمونی\n\n۱۴۰.۵۰ درهم کم شده	\N	image	t	{media-sina/photos/photo_23@22-08-2025_12-23-44.jpg}	2026-02-28 14:37:41.297	2026-02-28 14:37:41.297	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwdu002o8o1snm2lugf7	2025-09-01 00:00:00	10:43	8000.00	AED	transfer	cmm56s17i00098oge2xb5or4t	\N	کارت به کارت سینا به فرنوش - ۸۰۰۰ درهم	\N	file	t	{media-sina/files/MWM3108252233933.PDF}	2026-02-28 14:37:41.299	2026-02-28 14:37:41.299	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwdw002w8o1sfypt70zp	2025-09-16 00:00:00	16:27	171.71	AED	income	cmm56s17000008ogezghgfclk	\N	171.71 درهم به حساب سینا واریز شده - بابت سود ۴.۵ درصد	\N	\N	f	{}	2026-02-28 14:37:41.301	2026-02-28 14:37:41.301	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwdy00328o1smqc1oehb	2025-09-23 00:00:00	12:16	384.13	AED	expense	cmm56s17l000b8ogen8sv9jjw	\N	سرویس رزومه\n384.13 AED	\N	image	t	{media-sina/photos/photo_28@23-09-2025_12-16-47.jpg}	2026-02-28 14:37:41.302	2026-02-28 14:56:26.832	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwdv002s8o1sui67vw41	2025-09-06 00:00:00	20:06	903.44	AED	expense	cmm56s17m000c8ogerjdoev6e	Tabby	پرداخت قسط دوم Tabby بابت کلاس رانندگی سینا	\N	image	t	{media-sina/photos/photo_25@06-09-2025_20-06-04.jpg}	2026-02-28 14:37:41.3	2026-02-28 14:57:15.923	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwdv002q8o1s5ne80axh	2025-09-01 00:00:00	10:49	500.00	AED	expense	cmm56s17f00078oge3yf8pp6g	Gitex	Gitex	\N	image	t	{media-sina/photos/photo_24@01-09-2025_10-49-58.jpg}	2026-02-28 14:37:41.299	2026-02-28 14:58:30.023	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwdm00288o1srt6jas2t	2025-07-26 00:00:00	14:57	7.00	AED	expense	cmm60aoac0000ry015m0ptwvq	\N	آب	\N	image	t	{media-sina/photos/photo_20@26-07-2025_14-57-19.jpg}	2026-02-28 14:37:41.29	2026-02-28 15:04:24.287	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwdo002c8o1shvqhlqde	2025-08-06 00:00:00	21:23	903.44	AED	expense	cmm56s17m000c8ogerjdoev6e	Tabby	قسط اول tabby برای کلاس رانندگی	\N	image	t	{media-sina/photos/photo_21@06-08-2025_21-23-02.jpg,media-sina/photos/photo_22@06-08-2025_21-23-02.jpg}	2026-02-28 14:37:41.293	2026-02-28 15:03:32.7	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwdk00248o1skl5v1qi7	2025-07-15 00:00:00	17:25	88.20	AED	expense	cmm56s17600018ogeqghk7vfb	\N	بستنی با نگین اینا لب دریا	\N	image	t	{media-sina/photos/photo_18@15-07-2025_17-25-15.jpg}	2026-02-28 14:37:41.288	2026-02-28 15:04:39.998	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwdz00368o1s32unnz2q	2025-10-12 00:00:00	13:09	2000.00	AED	transfer	cmm56s17i00098oge2xb5or4t	\N	کارت به کارت سینا به نگین برای شرکت	\N	file	t	{media-sina/files/MLC1210251249882.PDF}	2026-02-28 14:37:41.303	2026-02-28 15:24:31.22	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwdg001y8o1sjwq95iyb	2025-07-06 00:00:00	13:44	100.00	AED	expense	cmm56s17a00048ogeacrpia4x	DU	شارژ DU سیم کارت سینا	\N	image	t	{media-sina/photos/photo_17@06-07-2025_13-44-52.jpg,"media-sina/files/Gmail - Successful recharge.pdf"}	2026-02-28 14:37:41.285	2026-02-28 15:06:20.096	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwdf001w8o1s9xu86abc	2025-07-06 00:00:00	13:42	\N	AED	expense	\N	\N		\N	file	t	{"media-sina/files/Gmail - Successful recharge.pdf"}	2026-02-28 14:37:41.284	2026-02-28 15:05:50.743	cmm6fdwdg001y8o1sjwq95iyb	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwdx00308o1swt08spqm	2025-09-23 00:00:00	12:12	5000.00	AED	transfer	cmm56s17i00098oge2xb5or4t	\N	کارت به کارت سینا به فرنوش	\N	file	t	{media-sina/files/MWM2309250954347.PDF}	2026-02-28 14:37:41.302	2026-02-28 15:24:54.789	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwdx002y8o1s9j5yaxdd	2025-09-23 00:00:00	01:02	13000.00	AED	income	cmm56s17000008ogezghgfclk	Mashreq ATM	واریز به حساب از طریق دستگاه ATM	\N	image	t	{media-sina/photos/photo_27@23-09-2025_01-02-21.jpg}	2026-02-28 14:37:41.301	2026-02-28 15:25:09.548	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwdw002u8o1sfpek9lyx	2025-09-08 00:00:00	12:21	2000.00	AED	income	cmm56s17000008ogezghgfclk	Mashreq ATM	واریز به حساب از طریق دستگاه ATM	\N	image	t	{media-sina/photos/photo_26@08-09-2025_12-21-09.jpg}	2026-02-28 14:37:41.3	2026-02-28 15:25:33.405	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwdu002m8o1sus32cubz	2025-08-31 00:00:00	12:04	6000.00	AED	transfer	cmm56s17i00098oge2xb5or4t	\N	۶۰۰۰ درهم سینا به حساب شرکت واریز کرده	\N	file	t	{media-sina/files/MWM3108251025460.PDF}	2026-02-28 14:37:41.298	2026-02-28 15:26:10.322	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwdt002k8o1sprv1uc2o	2025-08-25 00:00:00	09:06	8248.47	AED	transfer	cmm56s17i00098oge2xb5or4t	\N	۸۲۴۸.۴۷ درهم به حساب سینا واریز شده - نصیر زده	\N	\N	f	{}	2026-02-28 14:37:41.298	2026-02-28 15:26:30.041	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwdl00268o1scerbmtwn	2025-07-16 00:00:00	13:55	10000.00	AED	income	cmm56s17000008ogezghgfclk	Mashreq ATM	واریز به حساب از طریق دستگاه ATM	\N	image	t	{media-sina/photos/photo_19@16-07-2025_13-55-13.jpg}	2026-02-28 14:37:41.289	2026-02-28 15:27:13.799	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwde001s8o1se7hv4rh6	2025-06-12 00:00:00	09:07	1999.90	AED	transfer	cmm56s17i00098oge2xb5or4t	\N	1999.90 درهم از دانشگاه به حساب سینا واریز شده	\N	\N	f	{}	2026-02-28 14:37:41.283	2026-02-28 15:27:38.593	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwe0003a8o1s2ux09myy	2025-10-20 00:00:00	09:12	7.00	AED	expense	cmm56s17800028ogefz2eqqt0	سوپرمارکت محل	سینا ۷ درهم از سوپرمارکت پایین خونه خرید کرده	\N	\N	f	{}	2026-02-28 14:37:41.304	2026-02-28 14:37:41.304	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwe1003c8o1solr5c1a5	2025-10-20 00:00:00	22:21	13.00	AED	expense	cmm56s17800028ogefz2eqqt0	سوپرمارکت محل	سینا ۱۳ درهم از سوپرمارکت پایین خونه خرید کرده	\N	\N	f	{}	2026-02-28 14:37:41.305	2026-02-28 14:37:41.305	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwe2003i8o1sicp2ikmg	2025-10-27 00:00:00	12:05	260.00	AED	expense	cmm56s17600018ogeqghk7vfb	Khodemoni	سفارش غذا از خودمونی\n\n۲۶۰ درهم کم شده	\N	image	t	{media-sina/photos/photo_32@27-10-2025_12-05-48.jpg}	2026-02-28 14:37:41.307	2026-02-28 14:37:41.307	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwe3003k8o1scfwssf7g	2025-10-26 00:00:00	19:42	16.00	AED	expense	cmm56s17800028ogefz2eqqt0	سوپرمارکت محل	سینا ۱۶ درهم از سوپرمارکت پایین خونه تخم مرغ خریده	\N	\N	f	{}	2026-02-28 14:37:41.307	2026-02-28 14:37:41.307	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwe600408o1s3pbll32i	2025-11-02 00:00:00	07:57	10.50	AED	expense	cmm56s17800028ogefz2eqqt0	سوپرمارکت محل	سینا ۱۰.۵۰ درهم از سوپرمارکت پایین خونه نون خریده	\N	\N	f	{}	2026-02-28 14:37:41.311	2026-02-28 14:37:41.311	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwe900488o1sbaawx3ja	2025-11-08 00:00:00	10:14	41.50	AED	expense	cmm56s17800028ogefz2eqqt0	سوپرمارکت محل	سینا ۴۱.۵۰ درهم از سوپرمارکت پایین خونه تخم مرغ خریده	\N	\N	f	{}	2026-02-28 14:37:41.313	2026-02-28 14:37:41.313	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwea004c8o1sh14z6afs	2025-11-11 00:00:00	12:37	9.50	AED	expense	cmm56s17800028ogefz2eqqt0	سوپرمارکت محل	سینا ۹.۵۰ درهم از سوپرمارکت پایین خونه خرید کرده	\N	\N	f	{}	2026-02-28 14:37:41.314	2026-02-28 14:37:41.314	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwea004e8o1s4qgbly32	2025-11-14 00:00:00	11:17	7.00	AED	expense	cmm56s17800028ogefz2eqqt0	سوپرمارکت محل	سینا ۷ درهم از سوپرمارکت پایین خونه خرید کرده	\N	\N	f	{}	2026-02-28 14:37:41.315	2026-02-28 14:37:41.315	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdweb004g8o1s5g937y8i	2025-11-23 00:00:00	20:41	10.00	AED	expense	cmm56s17800028ogefz2eqqt0	سوپرمارکت محل	سینا ۱۰ درهم از سوپرمارکت پایین خونه خرید کرده	\N	\N	f	{}	2026-02-28 14:37:41.315	2026-02-28 14:37:41.315	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwec004k8o1snjnehn85	2025-12-03 00:00:00	08:57	40.00	AED	expense	cmm56s17800028ogefz2eqqt0	سوپرمارکت محل	سینا ۴۰ درهم از سوپرمارکت پایین خونه خرید کرده	\N	\N	f	{}	2026-02-28 14:37:41.316	2026-02-28 14:37:41.316	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwec004m8o1sfgcuyz34	2025-12-03 00:00:00	10:43	16.50	AED	expense	cmm56s17800028ogefz2eqqt0	سوپرمارکت محل	سینا ۱۶.۵۰ درهم از سوپرمارکت پایین خونه خرید کرده	\N	\N	f	{}	2026-02-28 14:37:41.317	2026-02-28 14:37:41.317	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwed004q8o1s0khi539x	2025-12-18 00:00:00	18:35	132.00	AED	expense	cmm5cqzf10001pw01d9pekwf0	Tamara	قسط اول تامارا برای خرید از آمازون	\N	image	t	{media-sina/photos/photo_43@18-12-2025_18-35-06.jpg}	2026-02-28 14:37:41.318	2026-02-28 14:47:49.721	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwed004o8o1somz9d5es	2025-12-12 00:00:00	15:58	55.00	AED	expense	cmm56s17f00078oge3yf8pp6g	\N	گل سینا برای گلش🥰	\N	image	t	{media-sina/photos/photo_42@12-12-2025_15-58-43.jpg}	2026-02-28 14:37:41.317	2026-02-28 14:48:26.724	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwe700428o1so36v9wv5	2025-11-09 00:00:00	13:58	\N	AED	expense	cmm56s17m000c8ogerjdoev6e	\N	\N	\N	image	t	{media-sina/photos/photo_39@09-11-2025_13-58-21.jpg}	2026-02-28 14:37:41.312	2026-02-28 14:49:38.276	cmm6fdwe800448o1s7e82ixto	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwe800468o1sx91rpzgu	2025-11-07 00:00:00	16:03	143.85	AED	expense	cmm56s17900038ogeyynewip3	Moov	۱۴۳.۸۵ درهم Moov از حساب کم کرده	\N	\N	f	{}	2026-02-28 14:37:41.313	2026-02-28 14:49:51.606	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwe6003y8o1syc9vm6vb	2025-10-31 00:00:00	16:13	30.00	AED	expense	cmm56s17a00048ogeacrpia4x	DU	۳۰ درهم بابت اینترنت خط سینا کم شده	\N	\N	f	{}	2026-02-28 14:37:41.31	2026-02-28 14:50:13.6	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwe5003w8o1slpoxwgft	2025-10-29 00:00:00	19:05	30.00	AED	expense	cmm56s17a00048ogeacrpia4x	DU	اینترنت du خط سینا	\N	image	t	{media-sina/photos/photo_38@29-10-2025_19-05-43.jpg}	2026-02-28 14:37:41.31	2026-02-28 14:50:51.421	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwe3003m8o1swzpp3vv4	2025-10-29 00:00:00	19:02	\N	AED	expense	\N	\N		\N	image	t	{media-sina/photos/photo_33@29-10-2025_19-02-30.jpg}	2026-02-28 14:37:41.308	2026-02-28 14:53:13.189	cmm6fdwe4003o8o1sor3b5at3	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwe4003q8o1sn6xp6ksp	2025-10-29 00:00:00	19:04	566.25	AED	expense	\N	\N	عینک سینا ۵۶۶.۲۵ درهم	\N	image	t	{media-sina/photos/photo_35@29-10-2025_19-04-11.jpg}	2026-02-28 14:37:41.309	2026-02-28 14:53:13.189	cmm6fdwe4003o8o1sor3b5at3	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwe5003s8o1sj5qr4ldl	2025-10-29 00:00:00	19:04	\N	AED	expense	\N	\N		\N	image	t	{media-sina/photos/photo_36@29-10-2025_19-04-11.jpg}	2026-02-28 14:37:41.309	2026-02-28 14:53:13.189	cmm6fdwe4003o8o1sor3b5at3	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwe2003g8o1sjw8yvp73	2025-10-27 00:00:00	12:03	258.00	AED	expense	cmm56s17800028ogefz2eqqt0	Seyed Kazem	خرید میوه از سید کاظم میرجلیلی	\N	image	t	{media-sina/photos/photo_31@27-10-2025_12-03-21.jpg}	2026-02-28 14:37:41.306	2026-02-28 14:54:25.417	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdweb004i8o1sxbjnw6jz	2025-12-04 00:00:00	15:29	2000.00	AED	income	cmm56s17000008ogezghgfclk	Mashreq ATM	واریز به حساب از طریق دستگاه ATM	\N	image	t	{media-sina/photos/photo_41@04-12-2025_15-29-58.jpg}	2026-02-28 14:37:41.316	2026-02-28 15:22:11.101	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwe9004a8o1s3t0ypijz	2025-11-09 00:00:00	14:02	2001.00	AED	transfer	cmm56s17i00098oge2xb5or4t	\N	کارت به کارت به نگین برای شرکت	\N	file	t	{media-sina/files/MLC0811251071612.PDF}	2026-02-28 14:37:41.314	2026-02-28 15:22:30.306	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwe1003e8o1svmp74s96	2025-10-27 00:00:00	12:01	920.00	AED	transfer	cmm56s17i00098oge2xb5or4t	\N	بلیت هواپیما برای داداش ونوس	\N	image	t	{media-sina/photos/photo_30@27-10-2025_12-01-30.jpg}	2026-02-28 14:37:41.306	2026-02-28 15:24:06.153	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdweg004y8o1s4zhtp7dk	2025-12-19 00:00:00	12:28	372.00	AED	expense	cmm56s17f00078oge3yf8pp6g	The View of The Palm	۳۷۲ درهم بابت The view of the palm برای ۴ نفرمون دادیم	\N	\N	f	{}	2026-02-28 14:37:41.32	2026-02-28 14:37:41.32	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdweg00508o1srgi8f6ad	2025-12-19 00:00:00	19:33	5.25	AED	expense	cmm56s17800028ogefz2eqqt0	سوپرمارکت محل	۵.۲۵ درهم از سوپرمارکت پایین خونه فلفل دلمه‌ای خریدیم	\N	\N	f	{}	2026-02-28 14:37:41.32	2026-02-28 14:37:41.32	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdweg00528o1si4ax7cex	2025-12-20 00:00:00	11:47	16.00	AED	expense	cmm56s17800028ogefz2eqqt0	MMI	۱۶ درهم بابت آبجو از MMI	\N	\N	f	{}	2026-02-28 14:37:41.321	2026-02-28 14:37:41.321	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdweh00548o1sncyrrvt1	2025-12-20 00:00:00	16:30	39.75	AED	expense	cmm56s17800028ogefz2eqqt0	سوپرمارکت محل	سینا ۳۹.۷۵ درهم از سوپرمارکت پایین خونه خرید کرده	\N	\N	f	{}	2026-02-28 14:37:41.321	2026-02-28 14:37:41.321	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdweh00568o1s3t1wnttu	2025-12-21 00:00:00	13:28	105.00	AED	expense	cmm56s17f00078oge3yf8pp6g	Butterfly Garden	۱۰۵ درهم ورودی باترفلای butterfly garden منو سینا	\N	\N	f	{}	2026-02-28 14:37:41.322	2026-02-28 14:37:41.322	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwei00588o1sp4jr5vg4	2025-12-21 00:00:00	14:58	20.00	AED	expense	cmm56s17l000b8ogen8sv9jjw	Cursor	۲۰ درهم بابت خرید cursor	\N	\N	f	{}	2026-02-28 14:37:41.322	2026-02-28 14:37:41.322	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwei005a8o1sgnyc28kp	2025-12-22 00:00:00	22:09	22.00	AED	expense	cmm56s17800028ogefz2eqqt0	MMI	۲۲ درهم بابت آبجو از MMI	\N	\N	f	{}	2026-02-28 14:37:41.323	2026-02-28 14:37:41.323	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwel005k8o1sfmxtvfas	2026-01-06 00:00:00	22:15	8.00	AED	expense	cmm56s17l000b8ogen8sv9jjw	\N	۸ درهم خرید بازی ps	\N	\N	f	{}	2026-02-28 14:37:41.325	2026-02-28 14:37:41.325	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwem005o8o1sufciofgk	2026-01-12 00:00:00	20:03	2000.00	AED	income	cmm56s17000008ogezghgfclk	\N	۲۰۰۰ درهم از دستگاه ATM به حسابت واریز شده	\N	\N	f	{}	2026-02-28 14:37:41.326	2026-02-28 14:37:41.326	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwen005w8o1sblg821ev	2026-01-29 00:00:00	14:42	12.00	AED	expense	cmm56s17800028ogefz2eqqt0	سوپرمارکت محل	۱۲ درهم خرید از سوپرمارکت پایین	\N	\N	f	{}	2026-02-28 14:37:41.328	2026-02-28 14:37:41.328	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwep00648o1skun605tf	2026-02-24 00:00:00	15:25	418.00	AED	transfer	cmm56s17i00098oge2xb5or4t	\N	کارت به کارت به نگین برای شرکت\n۴۱۸ درهم هم با کارت mbank واریز کردیم \nجمعا ۲,۲۱۰ درهم که ۲۱۰ درهمش بابت ناهار و قایق در حتاست	\N	file	t	{media-sina/files/MLC2202262189680.PDF}	2026-02-28 14:37:41.33	2026-02-28 14:37:41.33	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwek005i8o1srr5fvsu0	2026-01-05 00:00:00	10:48	50.00	AED	expense	cmm56s17a00048ogeacrpia4x	DU	۵۰ درهم بابت اینترنت خط سینا	\N	\N	f	{}	2026-02-28 14:37:41.325	2026-02-28 14:44:09.865	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwek005g8o1svqtuknlu	2026-01-02 00:00:00	16:47	49.00	AED	expense	cmm56s17l000b8ogen8sv9jjw	Tabby	برداشت بابت تبی پلاس	\N	image	t	{media-sina/photos/photo_48@02-01-2026_16-47-31.jpg}	2026-02-28 14:37:41.324	2026-02-28 14:44:34.524	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwen005u8o1sjb03qy61	2026-01-26 00:00:00	20:54	25.75	AED	expense	cmm56s17800028ogefz2eqqt0	Spinneys	Spinneys	\N	image	t	{media-sina/photos/photo_51@26-01-2026_20-54-06.jpg}	2026-02-28 14:37:41.327	2026-02-28 14:45:17.415	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwen005s8o1slw5584rm	2026-01-26 00:00:00	20:53	9.95	AED	expense	cmm56s17800028ogefz2eqqt0	Geant	Geant	\N	image	t	{media-sina/photos/photo_50@26-01-2026_20-53-57.jpg}	2026-02-28 14:37:41.327	2026-02-28 14:45:24.919	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwem005q8o1s8s12qgwe	2026-01-18 00:00:00	16:16	43.69	AED	expense	cmm56s17800028ogefz2eqqt0	Spinneys	Spinneys	\N	image	t	{media-sina/photos/photo_49@18-01-2026_16-16-09.jpg}	2026-02-28 14:37:41.327	2026-02-28 14:45:33.772	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwee004s8o1sucewmfxm	2025-12-18 00:00:00	18:36	135.91	AED	expense	cmm5cqzf10001pw01d9pekwf0	Tamara	قسط دوم تامارا برای خرید از آمازون	\N	image	t	{media-sina/photos/photo_44@18-12-2025_18-36-14.jpg}	2026-02-28 14:37:41.318	2026-02-28 14:46:54.602	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwee004u8o1s0j2p58yd	2025-12-18 00:00:00	18:36	22.50	AED	expense	cmm5cqzf10001pw01d9pekwf0	Tamara	قسط دوم تامارا برای خرید از home centre	\N	image	t	{media-sina/photos/photo_45@18-12-2025_18-36-38.jpg}	2026-02-28 14:37:41.319	2026-02-28 14:47:14.746	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwef004w8o1s9bjcsiso	2025-12-18 00:00:00	18:36	2.00	AED	expense	cmm56s17900038ogeyynewip3	\N	پول پارکینگ	\N	image	t	{media-sina/photos/photo_46@18-12-2025_18-36-45.jpg}	2026-02-28 14:37:41.319	2026-02-28 14:47:34.079	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwe800448o1s7e82ixto	2025-11-09 00:00:00	13:58	903.44	AED	expense	cmm56s17m000c8ogerjdoev6e	Tabby	قسط آخر Tabby کلاس رانندگی سینا	\N	image	t	{media-sina/photos/photo_40@09-11-2025_13-58-21.jpg,media-sina/photos/photo_39@09-11-2025_13-58-21.jpg}	2026-02-28 14:37:41.312	2026-02-28 14:49:38.276	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwdz00388o1sc4bdqg60	2025-10-13 00:00:00	14:37	2300.00	AED	expense	cmm56s17900038ogeyynewip3	\N	۲,۳۰۰ درهم بابت اجاره ماشین دادیم	\N	file	t	{media-sina/files/ReturnPDF.pdf}	2026-02-28 14:37:41.304	2026-02-28 14:55:51.389	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdweo005y8o1sbmqekjov	2026-02-12 00:00:00	16:46	135.91	AED	expense	cmm5cqzf10001pw01d9pekwf0	Tamara	قسط آخر تامارا بابت خرید از آمازون برای لوازم خونه	\N	image	t	{media-sina/photos/photo_52@15-02-2026_13-56-33.jpg}	2026-02-28 14:37:41.328	2026-02-28 15:19:15.903	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwep00628o1s4ltnonjh	2026-02-24 00:00:00	14:31	1000.00	AED	income	cmm56s17000008ogezghgfclk	Mashreq ATM	واریز به حساب از دستگاه ATM	\N	image	t	{media-sina/photos/photo_53@24-02-2026_14-31-09.jpg}	2026-02-28 14:37:41.329	2026-02-28 15:20:18.177	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwel005m8o1sk3p026xk	2026-01-18 00:00:00	16:14	1830.00	AED	transfer	cmm56s17i00098oge2xb5or4t	\N	کارت به کارت به نگین برای شرکت	\N	file	t	{media-sina/files/MLC1201261122869.PDF}	2026-02-28 14:37:41.325	2026-02-28 15:20:49.379	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwej005c8o1shmzihfyh	2026-01-02 00:00:00	16:46	15.00	AED	expense	cmm56s17800028ogefz2eqqt0	\N	خرید سوپرمارکت	\N	image	t	{media-sina/photos/photo_47@02-01-2026_16-46-52.jpg,cmm6fdwej005c8o1shmzihfyh/384c0cae-de25-49f2-8943-ebedf1ef908b.jpg}	2026-02-28 14:37:41.323	2026-03-02 13:15:03.914	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwej005e8o1s1el2bxs9	2026-01-02 00:00:00	16:47	1000.00	AED	income	cmm56s17000008ogezghgfclk	\N	کارت به کارت از فرنوش به سینا	\N	file	t	{media-sina/files/MWM3112252034189.PDF}	2026-02-28 14:37:41.324	2026-02-28 15:33:04.159	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwe5003u8o1st6ql21wk	2025-10-29 00:00:00	19:04	\N	AED	expense	\N	\N		\N	image	t	{media-sina/photos/photo_37@29-10-2025_19-04-11.jpg}	2026-02-28 14:37:41.309	2026-02-28 14:53:13.189	cmm6fdwe4003o8o1sor3b5at3	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwe4003o8o1sor3b5at3	2025-10-29 00:00:00	19:02	141.56	AED	expense	cmm5cqzf10001pw01d9pekwf0	Tabby	پرداخت قسط اول Tabby بابت عینک سینا\n\nکلش ۵۶۶.۲۵ درهم شد | عینک سینا ۵۶۶.۲۵ درهم	\N	image	t	{media-sina/photos/photo_34@29-10-2025_19-02-31.jpg,media-sina/photos/photo_33@29-10-2025_19-02-30.jpg,media-sina/photos/photo_35@29-10-2025_19-04-11.jpg,media-sina/photos/photo_36@29-10-2025_19-04-11.jpg,media-sina/photos/photo_37@29-10-2025_19-04-11.jpg}	2026-02-28 14:37:41.308	2026-02-28 15:23:48.262	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwdy00348o1swxt5sjw5	2025-10-12 00:00:00	13:07	903.44	AED	expense	cmm56s17m000c8ogerjdoev6e	Tabby	پرداخت قسط سوم Tabby بابت کلاس رانندگی سینا	\N	image	t	{media-sina/photos/photo_29@12-10-2025_13-07-37.jpg}	2026-02-28 14:37:41.303	2026-02-28 14:56:18.187	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwdp002e8o1sytqdnyrf	2025-08-06 00:00:00	21:23	\N	AED	expense	cmm56s17m000c8ogerjdoev6e	\N	\N	\N	image	t	{media-sina/photos/photo_22@06-08-2025_21-23-02.jpg}	2026-02-28 14:37:41.294	2026-02-28 15:03:32.7	cmm6fdwdo002c8o1shvqhlqde	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwdd001o8o1snbv362km	2025-05-11 00:00:00	17:36	1.00	AED	expense	cmm56s17l000b8ogen8sv9jjw	Tamara	۱ درهم تامارا از حساب سینا کم کرده	\N	\N	f	{}	2026-02-28 14:37:41.282	2026-02-28 15:06:07.663	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwd4000s8o1sy355u2kr	2025-04-15 00:00:00	11:22	90.90	AED	expense	cmm56s17800028ogefz2eqqt0	Day To Day	دی تو دی\nDay To Day	\N	image	t	{media-sina/photos/photo_5@15-04-2025_11-22-57.jpg}	2026-02-28 14:37:41.273	2026-02-28 15:10:48.776	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwd3000m8o1sjqri1cnj	2025-04-13 00:00:00	13:12	54.21	AED	expense	cmm56s17800028ogefz2eqqt0	Geant	Geant	\N	image	t	{media-sina/photos/photo_4@13-04-2025_13-12-54.jpg}	2026-02-28 14:37:41.271	2026-02-28 15:11:46.089	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwd2000k8o1shxgaml1r	2025-04-13 00:00:00	13:10	180.42	AED	expense	cmm56s17800028ogefz2eqqt0	Geant	Geant	\N	image	t	{media-sina/photos/photo_3@13-04-2025_13-10-54.jpg}	2026-02-28 14:37:41.27	2026-02-28 15:12:10.279	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdweo00608o1s913m0jgm	2026-02-15 00:00:00	14:14	344.00	AED	expense	cmm5cqzf10001pw01d9pekwf0	Amazon	خرید از آمازون	\N	file	t	{media-sina/files/0B788FBC-B826-4708-9FF5-36D53E2BC14A_9E224C9CC36A.pdf}	2026-02-28 14:37:41.329	2026-02-28 15:18:54.995	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwd7000y8o1svp3hun8u	2025-04-19 00:00:00	15:54	10000.00	AED	transfer	cmm56s17i00098oge2xb5or4t	\N	کارت به کارت به فرنوش	\N	file	t	{media-sina/files/MWM1704251984084.PDF}	2026-02-28 14:37:41.276	2026-02-28 15:30:10.804	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwd5000u8o1sodtrfjab	2025-04-15 00:00:00	11:23	10000.00	AED	income	cmm56s17000008ogezghgfclk	Mashreq ATM	واریز به حساب از طریق دستگاه ATM	\N	image	t	{media-sina/photos/photo_6@15-04-2025_11-23-36.jpg}	2026-02-28 14:37:41.273	2026-02-28 15:30:37.138	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwco00068o1sg8h2fvxo	2025-04-13 00:00:00	12:58	2000.00	AED	income	cmm56s17000008ogezghgfclk	Mashreq ATM	واریز به حساب از طریق دستگاه ATM	\N	image	t	{media-sina/photos/photo_2@13-04-2025_12-58-24.jpg}	2026-02-28 14:37:41.257	2026-02-28 15:31:01.614	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwcf00028o1s2vw3hzb1	2025-04-13 00:00:00	12:54	10000.00	AED	income	cmm56s17000008ogezghgfclk	Mashreq ATM	واریز به حساب از طریق دستگاه ATM	\N	image	t	{media-sina/photos/photo_1@13-04-2025_12-54-48.jpg}	2026-02-28 14:37:41.247	2026-02-28 15:31:10.899	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwd0000g8o1svz2jv3p1	2025-04-07 00:00:00	09:09	1904.55	AED	transfer	cmm56s17i00098oge2xb5or4t	\N	1904.55 درهم از دانشگاه به حساب سینا واریز شده	\N	\N	f	{}	2026-02-28 14:37:41.269	2026-02-28 15:34:05.08	\N	cmm6fbnk800008o9w89ze2ol6	\N
cmm6fdwci00048o1sal7ogv6d	2025-03-20 00:00:00	11:06	1892.05	AED	transfer	cmm56s17i00098oge2xb5or4t	\N	1892.05 درهم از دانشگاه به حساب سینا واریز شده	\N	\N	f	{}	2026-02-28 14:37:41.25	2026-02-28 15:34:25.431	\N	cmm6fbnk800008o9w89ze2ol6	\N
message902	2026-01-08 00:00:00	16:06	153.45	AED	expense	cmm56s17800028ogefz2eqqt0	Choithrams	CHOITHRAMS	["Shopping bag","Sweet potato","Beetroot","Bertolli extra virgin olive oil 750ml","Nectarine South Africa","Banana Chiquita Ecuador","Kiwi New Zealand","Tomato local pack of 6","Glad aluminium foil 200 sq ft","Al Jazira eggs white family pack 15s","Nescafe 2in1 30x11.7g sugar free"]	image	t	{photos/photo_542@08-01-2026_16-06-54.jpg,photos/photo_541@08-01-2026_16-06-54.jpg,message902/62f74262-fb24-46c5-8778-111386261288.jpg}	2026-02-27 17:48:58.553	2026-03-02 13:00:08.808	\N	default_farnoosh_mashreq	\N
message890	2026-01-02 00:00:00	00:39	503.93	AED	expense	cmm56s17800028ogefz2eqqt0	Carrefour (Wafi Mall)	کارفور	["Plast Shopping Bags","Potato","Pear Forelle","Beetroot","Onion Red","Apple Green","Mango Priyoor","Lime Green","Peach Flat","Plum Yellow","Driscoll's Strawbe x2","Capsicum Mix Pack","Sweet Corn","Kiwi","Kalleh 1500ml x2","Heinz Ketchup","Ponti Vinegar 260ml","Napa SY LF PL 360gr","Heinz Dressing 225ml","Mozzarella 450g","Mushroom 260g","Gyloaf Pizza 850g","W/Bakery Slice 550g","Byra Date Saghi 40","Barilla Pasta 500g","Nestea CC BI 200g","Boehli Stick 100g","Fine HT 21x21cm","Kit Kat MP 405x4","Skittles 38g","Barebells Bar 55g x2","BB Peanut Caramel","Coco Thumb Premium","NOR Salmon Fillet x2","Fine TR 4R 3PLY"]	image	t	{photos/photo_535@02-01-2026_00-39-16.jpg,message890/155a1457-9a12-4dea-9768-e37dc1afb46b.jpg}	2026-02-27 17:48:58.553	2026-03-02 13:16:23.288	\N	default_farnoosh_mashreq	\N
\.


--
-- Data for Name: user_preferences; Type: TABLE DATA; Schema: public; Owner: revenue
--

COPY public.user_preferences (id, entertainment, food, likes, "createdAt", "updatedAt", city, "companionType") FROM stdin;
default	{Cinema,Sea}	{Iranian,Avocado}	{Music}	2026-03-02 22:37:49.269	2026-03-03 06:51:52.096	Dubai	solo
\.


--
-- Data for Name: weekend_plans; Type: TABLE DATA; Schema: public; Owner: revenue
--

COPY public.weekend_plans (id, "weekLabel", plan, "createdAt", "linkedTransactionIds", ratings) FROM stdin;
cmm9rg0sd00008oae5jwb1bwr	۱۲ اسفند — آخر هفته	{"offers": [{"food": [{"meal": "ناهار", "name": "خورشت قیمه", "type": "homemade", "description": "یک وعده خانگی خوشمزه از خورشت قیمه با برنج.", "estimatedCost": 50}], "tips": ["از آب و هوای صبح استفاده کنید تا از پیاده‌روی لذت ببرید.", "به ساحل مناسب و کم‌جمعیت بروید."], "title": "پلن اقتصادی", "summary": "این برنامه شامل فعالیت‌های رایگان و کم‌هزینه برای لذت بردن از آخر هفته‌تان است.", "totalCost": 450, "activities": [{"name": "پیاده‌روی در ساحل", "category": "اقتصادی", "duration": "۲ ساعت", "timeSlot": "صبح", "description": "از زیبایی‌های ساحل لذت ببرید و پیاده‌روی کنید.", "estimatedCost": 0}]}, {"food": [{"meal": "ناهار", "name": "کباب کوبیده", "type": "restaurant", "description": "کباب کوبیده با برنج و سالاد در یک رستوران ایرانی.", "estimatedCost": 150}], "tips": ["بهتر است بلیط سینما را از قبل تهیه کنید.", "ساحل را با دوستان یا خانواده به اشتراک بگذارید تا لذت بیشتری ببرید."], "title": "پلن متعادل", "summary": "این برنامه شامل فعالیت‌های متنوع و ناهار در رستوران است.", "totalCost": 930, "activities": [{"name": "بازدید از سینما", "category": "متعادل", "duration": "۲ ساعت", "timeSlot": "عصر", "description": "یک فیلم الإيراني جدید را تماشا کنید.", "estimatedCost": 80}, {"name": "پیاده‌روی در ساحل", "category": "اقتصادی", "duration": "۱ ساعت", "timeSlot": "ظهر", "description": "از زیبایی‌های ساحل لذت ببرید.", "estimatedCost": 0}]}, {"food": [{"meal": "شام", "name": "فسنجان", "type": "restaurant", "description": "فسنجان خوشمزه به همراه برنج در یک رستوران ایرانی لوکس.", "estimatedCost": 590}], "tips": ["رزرو غواصی را از قبل انجام دهید.", "برای شام حتماً از رستوران‌های باکیفیت استفاده کنید."], "title": "پلن ویژه", "summary": "لذت بردن از بهترین تجربه‌ها با فعالیت‌های ویژه و غذایی لذیذ.", "totalCost": 1270, "activities": [{"name": "غواصی در دریا", "category": "ویژه", "duration": "۳ ساعت", "timeSlot": "عصر", "description": "یک تجربه خاص غواصی در دریای شفاف امارات.", "estimatedCost": 600}, {"name": "بازدید از سینما", "category": "متعادل", "duration": "۲ ساعت", "timeSlot": "شب", "description": "تماشای یک فیلم جدید ایرانی در سینما.", "estimatedCost": 80}]}]}	2026-03-02 22:38:34.238	\N	\N
cmm9rn6bt00018oaevhvvimic	۱۲ اسفند — آخر هفته	{"offers": [{"food": [{"area": "دبی", "meal": "ناهار", "name": "کباب تابه‌ای", "type": "restaurant", "mapUrl": "https://www.google.com/maps/search/رستوران+چلوکباب+نایب+دبی", "restaurant": "رستوران چلوکباب نایب", "description": "کباب تابه‌ای لذیذ و خوشمزه با طعمی اصیل در رستورانی معروف در دبی.", "estimatedCost": 50}], "tips": ["لباس مناسب برای آفتاب را فراموش نکنید.", "سعی کنید در ساعات صبح یا عصر به ساحل بروید تا از گرما کمتر رنج ببرید."], "title": "پلن اقتصادی", "summary": "یک روز آرام در کنار دریا و نوشیدنی ساده برای صرفه‌جویی در هزینه‌ها.", "totalCost": 50, "activities": [{"area": "جمیرا", "name": "بازدید از ساحل جمیرا", "mapUrl": "https://www.google.com/maps/search/ساحل+جمیرا+دبی", "category": "اقتصادی", "duration": "۲ ساعت", "location": "ساحل جمیرا", "timeSlot": "صبح", "description": "مکانی عالی برای پیاده‌روی و لذت بردن از آفتاب.", "estimatedCost": 0}]}, {"food": [{"area": "دبی", "meal": "شام", "name": "جوجه کباب", "type": "restaurant", "mapUrl": "https://www.google.com/maps/search/رستوران+ابراهیم+دبی", "restaurant": "رستوران ابراهیم", "description": "جوجه کباب لذیذ با برنج ایرانی.", "estimatedCost": 90}], "tips": ["از کرم ضد آفتاب استفاده کنید.", "ساحل کایت در ساعات عصر آرام‌تر است."], "title": "پلن متعادل", "summary": "ترکیبی از تفریح در ساحل و غذاهای ایرانی خوشمزه.", "totalCost": 640, "activities": [{"area": "خور دبی", "name": "پیاده‌روی در ساحل کایت", "mapUrl": "https://www.google.com/maps/search/ساحل+کایت+دبی", "category": "متعادل", "duration": "۳ ساعت", "location": "ساحل کایت", "timeSlot": "عصر", "description": "تفریح در کنار دریا با فضای دلپذیر و کافه‌های متنوع.", "estimatedCost": 0}]}, {"food": [{"area": "دبی", "meal": "ناهار", "name": "فصل بهار", "type": "restaurant", "mapUrl": "https://www.google.com/maps/search/رستوران+نازنازی+دبی", "restaurant": "رستوران نازنازی", "description": "غذای سالم و خوشمزه با طعم ایرانی.", "estimatedCost": 80}], "tips": ["بلیط سینما را از قبل رزرو کنید.", "سعی کنید از کافه‌های نزدیک سینما هم بازدید کنید."], "title": "پلن ویژه", "summary": "تجربه‌ای لوکس با سرو غذای خوشمزه ایرانی و تماشای فیلم در سینما.", "totalCost": 1150, "activities": [{"area": "دبی", "name": "تماشای فیلم در سینما", "mapUrl": "https://www.google.com/maps/search/سینما+سیتی+والک+دبی", "category": "ویژه", "duration": "۲ ساعت", "location": "سینما سیتی والک", "timeSlot": "شب", "description": "انتخاب فیلم دلخواه در سینماهای مدرن دبی.", "estimatedCost": 70}]}]}	2026-03-02 22:44:08.007	\N	{"food:0:0": "dislike", "activity:0:0": "like", "activity:1:0": "like"}
cmmafvl8m0001p5vk8ysc564v	۱۲ اسفند — آخر هفته	{"offers": [{"food": [{"area": "جمیرا", "meal": "ناهار", "name": "غذاهای ایرانی", "type": "restaurant", "mapUrl": "https://www.google.com/maps/search/رستوران+صدف+دبی", "restaurant": "رستوران صدف", "description": "غذاهای خوشمزه ایرانی با گزینه‌های مختلف.", "estimatedCost": 200}], "tips": ["از نوشیدنی‌های خنک حتماً استفاده کنید!", "ساعت‌های خلوت‌تر صبح را برای پیاده‌روی انتخاب کنید."], "title": "🌊 پلن اقتصادی", "summary": "یک روز آرام در ساحل جمیرا با فعالیت‌های ساده و خوشمزه.", "totalCost": 200, "activities": [{"area": "جمیرا", "name": "پیاده‌روی در ساحل جمیرا", "mapUrl": "https://www.google.com/maps/search/ساحل+جمیرا+دبی", "category": "اقتصادی", "duration": "۲ ساعت", "location": "ساحل جمیرا", "timeSlot": "صبح", "description": "پیاده‌روی و لذت بردن از مناظر زیبای دریا و آسمان.", "estimatedCost": 0}]}, {"food": [{"area": "جمیرا", "meal": "ناهار", "name": "غذای ایرانی با آووکادو", "type": "restaurant", "mapUrl": "https://www.google.com/maps/search/رستوران+هفت+چنار+دبی", "restaurant": "رستوران هفت چنار", "description": "غذای خوشمزه ایرانی همراه با آووکادو.", "estimatedCost": 150}], "tips": ["ساعت‌های شلوغ کافه را دور بزنید!", "نکاتی درباره استفاده از کرم ضد آفتاب فراموش نشود."], "title": "☕ پلن متعادل", "summary": "ترکیبی از لذت بردن از ساحل و غذایی خوشمزه به همراه فعالیت‌های سبک.", "totalCost": 580, "activities": [{"area": "جميرا بیچ ریزورت", "name": "کافه‌گردی در کافه زعفرانی", "mapUrl": "https://www.google.com/maps/search/کافه+زعفرانی+دبی", "category": "متعادل", "duration": "۲ ساعت", "location": "کافه زعفرانی", "timeSlot": "ظهر", "description": "استراحت و نوشیدن قهوه با منظره دریا.", "estimatedCost": 50}, {"area": "جمیرا", "name": "بازدید از ساحل کایت", "mapUrl": "https://www.google.com/maps/search/ساحل+کایت+دبی", "category": "متعادل", "duration": "۲ ساعت", "location": "ساحل کایت", "timeSlot": "عصر", "description": "لذت بردن از باد و فعالیت‌های آبی در ساحل کایت.", "estimatedCost": 0}]}, {"food": [{"area": "دبی", "meal": "شام", "name": "غذای ایرانی ویژه", "type": "restaurant", "mapUrl": "https://www.google.com/maps/search/رستوران+نکیسا+دبی", "restaurant": "رستوران نکیسا", "description": "احساس لذت در هر لقمه با غذاهای خوشمزه ایرانی.", "estimatedCost": 600}], "tips": ["برای جستجوی سینما بلیط‌ها را از قبل رزرو کنید.", "بهترین زمان برای بودن در کافه بعد از غروب آفتاب است."], "title": "🎉 پلن ویژه", "summary": "یک تجربه خاص با لحظات به یاد ماندنی در دبی.", "totalCost": 960, "activities": [{"area": "دبی مال", "name": "سینما در دبی مال", "mapUrl": "https://www.google.com/maps/search/سینما+دبی+مال+دبی", "category": "ویژه", "duration": "۲ ساعت", "location": "سینما دبی مال", "timeSlot": "ظهر", "description": "دیدن فیلم جدید در یکی از بهترین سینماهای دبی مال.", "estimatedCost": 60}, {"area": "جمیرا", "name": "شام با منظره در کافه مروارید", "mapUrl": "https://www.google.com/maps/search/کافه+مروارید+دبی", "category": "ویژه", "duration": "۲ ساعت", "location": "کافه مروارید", "timeSlot": "شب", "description": "شام لذیذ با مناظر زیبا از دریا.", "estimatedCost": 300}]}]}	2026-03-03 10:02:31.365	{}	{}
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: revenue
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: accounts accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: revenue
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (id);


--
-- Name: ai_prompts ai_prompts_pkey; Type: CONSTRAINT; Schema: public; Owner: revenue
--

ALTER TABLE ONLY public.ai_prompts
    ADD CONSTRAINT ai_prompts_pkey PRIMARY KEY (id);


--
-- Name: app_settings app_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: revenue
--

ALTER TABLE ONLY public.app_settings
    ADD CONSTRAINT app_settings_pkey PRIMARY KEY (id);


--
-- Name: bill_payments bill_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: revenue
--

ALTER TABLE ONLY public.bill_payments
    ADD CONSTRAINT bill_payments_pkey PRIMARY KEY (id);


--
-- Name: bills bills_pkey; Type: CONSTRAINT; Schema: public; Owner: revenue
--

ALTER TABLE ONLY public.bills
    ADD CONSTRAINT bills_pkey PRIMARY KEY (id);


--
-- Name: budgets budgets_pkey; Type: CONSTRAINT; Schema: public; Owner: revenue
--

ALTER TABLE ONLY public.budgets
    ADD CONSTRAINT budgets_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: revenue
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: currencies currencies_pkey; Type: CONSTRAINT; Schema: public; Owner: revenue
--

ALTER TABLE ONLY public.currencies
    ADD CONSTRAINT currencies_pkey PRIMARY KEY (id);


--
-- Name: income_sources income_sources_pkey; Type: CONSTRAINT; Schema: public; Owner: revenue
--

ALTER TABLE ONLY public.income_sources
    ADD CONSTRAINT income_sources_pkey PRIMARY KEY (id);


--
-- Name: installment_payments installment_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: revenue
--

ALTER TABLE ONLY public.installment_payments
    ADD CONSTRAINT installment_payments_pkey PRIMARY KEY (id);


--
-- Name: installments installments_pkey; Type: CONSTRAINT; Schema: public; Owner: revenue
--

ALTER TABLE ONLY public.installments
    ADD CONSTRAINT installments_pkey PRIMARY KEY (id);


--
-- Name: item_groups item_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: revenue
--

ALTER TABLE ONLY public.item_groups
    ADD CONSTRAINT item_groups_pkey PRIMARY KEY (id);


--
-- Name: meal_plans meal_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: revenue
--

ALTER TABLE ONLY public.meal_plans
    ADD CONSTRAINT meal_plans_pkey PRIMARY KEY (id);


--
-- Name: merchant_category_rules merchant_category_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: revenue
--

ALTER TABLE ONLY public.merchant_category_rules
    ADD CONSTRAINT merchant_category_rules_pkey PRIMARY KEY (id);


--
-- Name: money_advices money_advices_pkey; Type: CONSTRAINT; Schema: public; Owner: revenue
--

ALTER TABLE ONLY public.money_advices
    ADD CONSTRAINT money_advices_pkey PRIMARY KEY (id);


--
-- Name: notification_templates notification_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: revenue
--

ALTER TABLE ONLY public.notification_templates
    ADD CONSTRAINT notification_templates_pkey PRIMARY KEY (id);


--
-- Name: persons persons_pkey; Type: CONSTRAINT; Schema: public; Owner: revenue
--

ALTER TABLE ONLY public.persons
    ADD CONSTRAINT persons_pkey PRIMARY KEY (id);


--
-- Name: reserve_snapshots reserve_snapshots_pkey; Type: CONSTRAINT; Schema: public; Owner: revenue
--

ALTER TABLE ONLY public.reserve_snapshots
    ADD CONSTRAINT reserve_snapshots_pkey PRIMARY KEY (id);


--
-- Name: reserves reserves_pkey; Type: CONSTRAINT; Schema: public; Owner: revenue
--

ALTER TABLE ONLY public.reserves
    ADD CONSTRAINT reserves_pkey PRIMARY KEY (id);


--
-- Name: savings_goals savings_goals_pkey; Type: CONSTRAINT; Schema: public; Owner: revenue
--

ALTER TABLE ONLY public.savings_goals
    ADD CONSTRAINT savings_goals_pkey PRIMARY KEY (id);


--
-- Name: settlements settlements_pkey; Type: CONSTRAINT; Schema: public; Owner: revenue
--

ALTER TABLE ONLY public.settlements
    ADD CONSTRAINT settlements_pkey PRIMARY KEY (id);


--
-- Name: shopping_list_items shopping_list_items_pkey; Type: CONSTRAINT; Schema: public; Owner: revenue
--

ALTER TABLE ONLY public.shopping_list_items
    ADD CONSTRAINT shopping_list_items_pkey PRIMARY KEY (id);


--
-- Name: shopping_lists shopping_lists_pkey; Type: CONSTRAINT; Schema: public; Owner: revenue
--

ALTER TABLE ONLY public.shopping_lists
    ADD CONSTRAINT shopping_lists_pkey PRIMARY KEY (id);


--
-- Name: sms_patterns sms_patterns_pkey; Type: CONSTRAINT; Schema: public; Owner: revenue
--

ALTER TABLE ONLY public.sms_patterns
    ADD CONSTRAINT sms_patterns_pkey PRIMARY KEY (id);


--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: revenue
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- Name: transaction_items transaction_items_pkey; Type: CONSTRAINT; Schema: public; Owner: revenue
--

ALTER TABLE ONLY public.transaction_items
    ADD CONSTRAINT transaction_items_pkey PRIMARY KEY (id);


--
-- Name: transaction_splits transaction_splits_pkey; Type: CONSTRAINT; Schema: public; Owner: revenue
--

ALTER TABLE ONLY public.transaction_splits
    ADD CONSTRAINT transaction_splits_pkey PRIMARY KEY (id);


--
-- Name: transaction_tags transaction_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: revenue
--

ALTER TABLE ONLY public.transaction_tags
    ADD CONSTRAINT transaction_tags_pkey PRIMARY KEY ("transactionId", "tagId");


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: revenue
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: user_preferences user_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: revenue
--

ALTER TABLE ONLY public.user_preferences
    ADD CONSTRAINT user_preferences_pkey PRIMARY KEY (id);


--
-- Name: weekend_plans weekend_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: revenue
--

ALTER TABLE ONLY public.weekend_plans
    ADD CONSTRAINT weekend_plans_pkey PRIMARY KEY (id);


--
-- Name: accounts_name_key; Type: INDEX; Schema: public; Owner: revenue
--

CREATE UNIQUE INDEX accounts_name_key ON public.accounts USING btree (name);


--
-- Name: ai_prompts_key_key; Type: INDEX; Schema: public; Owner: revenue
--

CREATE UNIQUE INDEX ai_prompts_key_key ON public.ai_prompts USING btree (key);


--
-- Name: bill_payments_billId_idx; Type: INDEX; Schema: public; Owner: revenue
--

CREATE INDEX "bill_payments_billId_idx" ON public.bill_payments USING btree ("billId");


--
-- Name: budgets_categoryId_key; Type: INDEX; Schema: public; Owner: revenue
--

CREATE UNIQUE INDEX "budgets_categoryId_key" ON public.budgets USING btree ("categoryId");


--
-- Name: categories_name_key; Type: INDEX; Schema: public; Owner: revenue
--

CREATE UNIQUE INDEX categories_name_key ON public.categories USING btree (name);


--
-- Name: currencies_code_key; Type: INDEX; Schema: public; Owner: revenue
--

CREATE UNIQUE INDEX currencies_code_key ON public.currencies USING btree (code);


--
-- Name: installment_payments_installmentId_idx; Type: INDEX; Schema: public; Owner: revenue
--

CREATE INDEX "installment_payments_installmentId_idx" ON public.installment_payments USING btree ("installmentId");


--
-- Name: item_groups_canonicalName_key; Type: INDEX; Schema: public; Owner: revenue
--

CREATE UNIQUE INDEX "item_groups_canonicalName_key" ON public.item_groups USING btree ("canonicalName");


--
-- Name: merchant_category_rules_pattern_key; Type: INDEX; Schema: public; Owner: revenue
--

CREATE UNIQUE INDEX merchant_category_rules_pattern_key ON public.merchant_category_rules USING btree (pattern);


--
-- Name: notification_templates_key_key; Type: INDEX; Schema: public; Owner: revenue
--

CREATE UNIQUE INDEX notification_templates_key_key ON public.notification_templates USING btree (key);


--
-- Name: persons_name_key; Type: INDEX; Schema: public; Owner: revenue
--

CREATE UNIQUE INDEX persons_name_key ON public.persons USING btree (name);


--
-- Name: reserve_snapshots_reserveId_idx; Type: INDEX; Schema: public; Owner: revenue
--

CREATE INDEX "reserve_snapshots_reserveId_idx" ON public.reserve_snapshots USING btree ("reserveId");


--
-- Name: shopping_list_items_listId_idx; Type: INDEX; Schema: public; Owner: revenue
--

CREATE INDEX "shopping_list_items_listId_idx" ON public.shopping_list_items USING btree ("listId");


--
-- Name: shopping_list_items_normalizedName_idx; Type: INDEX; Schema: public; Owner: revenue
--

CREATE INDEX "shopping_list_items_normalizedName_idx" ON public.shopping_list_items USING btree ("normalizedName");


--
-- Name: sms_patterns_name_key; Type: INDEX; Schema: public; Owner: revenue
--

CREATE UNIQUE INDEX sms_patterns_name_key ON public.sms_patterns USING btree (name);


--
-- Name: sms_patterns_priority_idx; Type: INDEX; Schema: public; Owner: revenue
--

CREATE INDEX sms_patterns_priority_idx ON public.sms_patterns USING btree (priority);


--
-- Name: tags_name_key; Type: INDEX; Schema: public; Owner: revenue
--

CREATE UNIQUE INDEX tags_name_key ON public.tags USING btree (name);


--
-- Name: transaction_items_normalizedName_idx; Type: INDEX; Schema: public; Owner: revenue
--

CREATE INDEX "transaction_items_normalizedName_idx" ON public.transaction_items USING btree ("normalizedName");


--
-- Name: transaction_items_transactionId_idx; Type: INDEX; Schema: public; Owner: revenue
--

CREATE INDEX "transaction_items_transactionId_idx" ON public.transaction_items USING btree ("transactionId");


--
-- Name: transaction_splits_personId_idx; Type: INDEX; Schema: public; Owner: revenue
--

CREATE INDEX "transaction_splits_personId_idx" ON public.transaction_splits USING btree ("personId");


--
-- Name: transaction_splits_transactionId_idx; Type: INDEX; Schema: public; Owner: revenue
--

CREATE INDEX "transaction_splits_transactionId_idx" ON public.transaction_splits USING btree ("transactionId");


--
-- Name: transactions_accountId_idx; Type: INDEX; Schema: public; Owner: revenue
--

CREATE INDEX "transactions_accountId_idx" ON public.transactions USING btree ("accountId");


--
-- Name: transactions_categoryId_idx; Type: INDEX; Schema: public; Owner: revenue
--

CREATE INDEX "transactions_categoryId_idx" ON public.transactions USING btree ("categoryId");


--
-- Name: transactions_date_idx; Type: INDEX; Schema: public; Owner: revenue
--

CREATE INDEX transactions_date_idx ON public.transactions USING btree (date);


--
-- Name: transactions_merchant_idx; Type: INDEX; Schema: public; Owner: revenue
--

CREATE INDEX transactions_merchant_idx ON public.transactions USING btree (merchant);


--
-- Name: transactions_mergedIntoId_idx; Type: INDEX; Schema: public; Owner: revenue
--

CREATE INDEX "transactions_mergedIntoId_idx" ON public.transactions USING btree ("mergedIntoId");


--
-- Name: transactions_type_idx; Type: INDEX; Schema: public; Owner: revenue
--

CREATE INDEX transactions_type_idx ON public.transactions USING btree (type);


--
-- Name: bill_payments bill_payments_billId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: revenue
--

ALTER TABLE ONLY public.bill_payments
    ADD CONSTRAINT "bill_payments_billId_fkey" FOREIGN KEY ("billId") REFERENCES public.bills(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: budgets budgets_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: revenue
--

ALTER TABLE ONLY public.budgets
    ADD CONSTRAINT "budgets_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: installment_payments installment_payments_installmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: revenue
--

ALTER TABLE ONLY public.installment_payments
    ADD CONSTRAINT "installment_payments_installmentId_fkey" FOREIGN KEY ("installmentId") REFERENCES public.installments(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: merchant_category_rules merchant_category_rules_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: revenue
--

ALTER TABLE ONLY public.merchant_category_rules
    ADD CONSTRAINT "merchant_category_rules_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reserve_snapshots reserve_snapshots_reserveId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: revenue
--

ALTER TABLE ONLY public.reserve_snapshots
    ADD CONSTRAINT "reserve_snapshots_reserveId_fkey" FOREIGN KEY ("reserveId") REFERENCES public.reserves(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: settlements settlements_personId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: revenue
--

ALTER TABLE ONLY public.settlements
    ADD CONSTRAINT "settlements_personId_fkey" FOREIGN KEY ("personId") REFERENCES public.persons(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: shopping_list_items shopping_list_items_listId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: revenue
--

ALTER TABLE ONLY public.shopping_list_items
    ADD CONSTRAINT "shopping_list_items_listId_fkey" FOREIGN KEY ("listId") REFERENCES public.shopping_lists(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transaction_items transaction_items_transactionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: revenue
--

ALTER TABLE ONLY public.transaction_items
    ADD CONSTRAINT "transaction_items_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES public.transactions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transaction_splits transaction_splits_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: revenue
--

ALTER TABLE ONLY public.transaction_splits
    ADD CONSTRAINT "transaction_splits_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: transaction_splits transaction_splits_personId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: revenue
--

ALTER TABLE ONLY public.transaction_splits
    ADD CONSTRAINT "transaction_splits_personId_fkey" FOREIGN KEY ("personId") REFERENCES public.persons(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: transaction_splits transaction_splits_transactionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: revenue
--

ALTER TABLE ONLY public.transaction_splits
    ADD CONSTRAINT "transaction_splits_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES public.transactions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transaction_tags transaction_tags_tagId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: revenue
--

ALTER TABLE ONLY public.transaction_tags
    ADD CONSTRAINT "transaction_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES public.tags(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transaction_tags transaction_tags_transactionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: revenue
--

ALTER TABLE ONLY public.transaction_tags
    ADD CONSTRAINT "transaction_tags_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES public.transactions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transactions transactions_accountId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: revenue
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT "transactions_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES public.accounts(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: transactions transactions_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: revenue
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT "transactions_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: transactions transactions_mergedIntoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: revenue
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT "transactions_mergedIntoId_fkey" FOREIGN KEY ("mergedIntoId") REFERENCES public.transactions(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict Msagtdc1z0Ogs0zWRV0zryOqWn6wYL0NoymwrZt9Dog8pLYNSrOT1dHSd7LiJmf

