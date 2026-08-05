--
-- PostgreSQL database dump
--

\restrict a1AWhh34k9iRUKE04taKcK4aylgbXfIZ7D1deAF8mxbW7PmKSjJQTnDzXuUHdHd

-- Dumped from database version 15.17 (Homebrew)
-- Dumped by pg_dump version 15.17 (Homebrew)

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
-- Name: leagues; Type: TABLE; Schema: public; Owner: jcook
--

CREATE TABLE public.leagues (
    id integer NOT NULL,
    name character varying(200) NOT NULL,
    owner_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.leagues OWNER TO jcook;

--
-- Name: leagues_id_seq; Type: SEQUENCE; Schema: public; Owner: jcook
--

CREATE SEQUENCE public.leagues_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.leagues_id_seq OWNER TO jcook;

--
-- Name: leagues_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: jcook
--

ALTER SEQUENCE public.leagues_id_seq OWNED BY public.leagues.id;


--
-- Name: players; Type: TABLE; Schema: public; Owner: jcook
--

CREATE TABLE public.players (
    id integer NOT NULL,
    name character varying(200) NOT NULL,
    "position" character varying(100),
    team character varying(200),
    projected_points double precision
);


ALTER TABLE public.players OWNER TO jcook;

--
-- Name: players_id_seq; Type: SEQUENCE; Schema: public; Owner: jcook
--

CREATE SEQUENCE public.players_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.players_id_seq OWNER TO jcook;

--
-- Name: players_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: jcook
--

ALTER SEQUENCE public.players_id_seq OWNED BY public.players.id;


--
-- Name: teams; Type: TABLE; Schema: public; Owner: jcook
--

CREATE TABLE public.teams (
    id integer NOT NULL,
    name character varying(200) NOT NULL,
    user_id integer,
    league_id integer
);


ALTER TABLE public.teams OWNER TO jcook;

--
-- Name: teams_id_seq; Type: SEQUENCE; Schema: public; Owner: jcook
--

CREATE SEQUENCE public.teams_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.teams_id_seq OWNER TO jcook;

--
-- Name: teams_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: jcook
--

ALTER SEQUENCE public.teams_id_seq OWNED BY public.teams.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: jcook
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    password_hash character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO jcook;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: jcook
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO jcook;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: jcook
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: leagues id; Type: DEFAULT; Schema: public; Owner: jcook
--

ALTER TABLE ONLY public.leagues ALTER COLUMN id SET DEFAULT nextval('public.leagues_id_seq'::regclass);


--
-- Name: players id; Type: DEFAULT; Schema: public; Owner: jcook
--

ALTER TABLE ONLY public.players ALTER COLUMN id SET DEFAULT nextval('public.players_id_seq'::regclass);


--
-- Name: teams id; Type: DEFAULT; Schema: public; Owner: jcook
--

ALTER TABLE ONLY public.teams ALTER COLUMN id SET DEFAULT nextval('public.teams_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: jcook
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: leagues; Type: TABLE DATA; Schema: public; Owner: jcook
--

COPY public.leagues (id, name, owner_id, created_at) FROM stdin;
1	testLeague1	1	2026-04-04 15:00:59.599547
2	testTeam3	2	2026-04-04 15:06:41.84995
3	testTeam4	2	2026-04-04 15:06:52.74927
\.


--
-- Data for Name: players; Type: TABLE DATA; Schema: public; Owner: jcook
--

COPY public.players (id, name, "position", team, projected_points) FROM stdin;
1	Test Player	Test Position	Test Team	44
\.


--
-- Data for Name: teams; Type: TABLE DATA; Schema: public; Owner: jcook
--

COPY public.teams (id, name, user_id, league_id) FROM stdin;
1	testTeam1	1	1
2	testTeam2	2	1
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: jcook
--

COPY public.users (id, username, email, password_hash, created_at) FROM stdin;
1	testuser	test@test.com	$2b$10$ryDT30SrpqK9x/7RUxDTjuPvmptCfGqub4lpXCTH.Izdk8i9eUUka	2026-04-02 17:34:31.466751
2	testuser2	user2@test.com	$2b$10$vPOGrPrI5j5RvtCoWrB/fu4qcEwC7gtEk2Rqzr69EkySn.4qUf8Nu	2026-04-04 15:03:47.585994
\.


--
-- Name: leagues_id_seq; Type: SEQUENCE SET; Schema: public; Owner: jcook
--

SELECT pg_catalog.setval('public.leagues_id_seq', 3, true);


--
-- Name: players_id_seq; Type: SEQUENCE SET; Schema: public; Owner: jcook
--

SELECT pg_catalog.setval('public.players_id_seq', 1, true);


--
-- Name: teams_id_seq; Type: SEQUENCE SET; Schema: public; Owner: jcook
--

SELECT pg_catalog.setval('public.teams_id_seq', 2, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: jcook
--

SELECT pg_catalog.setval('public.users_id_seq', 2, true);


--
-- Name: leagues leagues_pkey; Type: CONSTRAINT; Schema: public; Owner: jcook
--

ALTER TABLE ONLY public.leagues
    ADD CONSTRAINT leagues_pkey PRIMARY KEY (id);


--
-- Name: players players_pkey; Type: CONSTRAINT; Schema: public; Owner: jcook
--

ALTER TABLE ONLY public.players
    ADD CONSTRAINT players_pkey PRIMARY KEY (id);


--
-- Name: teams teams_pkey; Type: CONSTRAINT; Schema: public; Owner: jcook
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: jcook
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: jcook
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: leagues leagues_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jcook
--

ALTER TABLE ONLY public.leagues
    ADD CONSTRAINT leagues_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id);


--
-- Name: teams teams_league_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jcook
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_league_id_fkey FOREIGN KEY (league_id) REFERENCES public.leagues(id);


--
-- Name: teams teams_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jcook
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict a1AWhh34k9iRUKE04taKcK4aylgbXfIZ7D1deAF8mxbW7PmKSjJQTnDzXuUHdHd

