--
-- PostgreSQL database dump
--

-- Dumped from database version 11.5
-- Dumped by pg_dump version 11.5

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

SET default_with_oids = false;

--
-- Name: user; Type: TABLE; Schema: public; Owner: administrator
--

CREATE TABLE public."user" (
    id integer NOT NULL,
    "firstName" character varying,
    "lastName" character varying
);


ALTER TABLE public."user" OWNER TO administrator;

--
-- Name: user_id_seq; Type: SEQUENCE; Schema: public; Owner: administrator
--

CREATE SEQUENCE public.user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_id_seq OWNER TO administrator;

--
-- Name: user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: administrator
--

ALTER SEQUENCE public.user_id_seq OWNED BY public."user".id;


--
-- Name: user id; Type: DEFAULT; Schema: public; Owner: administrator
--

ALTER TABLE ONLY public."user" ALTER COLUMN id SET DEFAULT nextval('public.user_id_seq'::regclass);


--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: administrator
--

COPY public."user" (id, "firstName", "lastName") FROM stdin;
1	Jasen	pan
2	1	2
\.


--
-- Name: user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: administrator
--

SELECT pg_catalog.setval('public.user_id_seq', 2, true);


--
-- Name: user user_pkey; Type: CONSTRAINT; Schema: public; Owner: administrator
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: administrator
--

REVOKE ALL ON SCHEMA public FROM rdsadmin;
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO administrator;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

