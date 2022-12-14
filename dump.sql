PGDMP         3                z            postgres #   14.5 (Ubuntu 14.5-0ubuntu0.22.04.1) #   14.5 (Ubuntu 14.5-0ubuntu0.22.04.1)     5           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false            6           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false            7           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false            8           1262    13797    postgres    DATABASE     ]   CREATE DATABASE postgres WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE = 'en_US.UTF-8';
    DROP DATABASE postgres;
                postgres    false            9           0    0    DATABASE postgres    COMMENT     N   COMMENT ON DATABASE postgres IS 'default administrative connection database';
                   postgres    false    3384            ?            1259    16410    links    TABLE     ?   CREATE TABLE public.links (
    id integer NOT NULL,
    url text NOT NULL,
    "shortUrl" text NOT NULL,
    "creatorId" integer NOT NULL,
    hits integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now()
);
    DROP TABLE public.links;
       public         heap    postgres    false            ?            1259    16409    links_id_seq    SEQUENCE     ?   CREATE SEQUENCE public.links_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.links_id_seq;
       public          postgres    false    214            :           0    0    links_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.links_id_seq OWNED BY public.links.id;
          public          postgres    false    213            ?            1259    16395    tokens    TABLE     ?   CREATE TABLE public.tokens (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    token text NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now()
);
    DROP TABLE public.tokens;
       public         heap    postgres    false            ?            1259    16394    tokens_id_seq    SEQUENCE     ?   CREATE SEQUENCE public.tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 $   DROP SEQUENCE public.tokens_id_seq;
       public          postgres    false    212            ;           0    0    tokens_id_seq    SEQUENCE OWNED BY     ?   ALTER SEQUENCE public.tokens_id_seq OWNED BY public.tokens.id;
          public          postgres    false    211            ?            1259    16385    users    TABLE     ?   CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    password character varying(100) NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now()
);
    DROP TABLE public.users;
       public         heap    postgres    false            ?            1259    16384    users_id_seq    SEQUENCE     ?   CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.users_id_seq;
       public          postgres    false    210            <           0    0    users_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;
          public          postgres    false    209            ?           2604    16413    links id    DEFAULT     d   ALTER TABLE ONLY public.links ALTER COLUMN id SET DEFAULT nextval('public.links_id_seq'::regclass);
 7   ALTER TABLE public.links ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    214    213    214            ?           2604    16398 	   tokens id    DEFAULT     f   ALTER TABLE ONLY public.tokens ALTER COLUMN id SET DEFAULT nextval('public.tokens_id_seq'::regclass);
 8   ALTER TABLE public.tokens ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    211    212    212            ?           2604    16388    users id    DEFAULT     d   ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);
 7   ALTER TABLE public.users ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    209    210    210            2          0    16410    links 
   TABLE DATA           T   COPY public.links (id, url, "shortUrl", "creatorId", hits, "createdAt") FROM stdin;
    public          postgres    false    214   ?       0          0    16395    tokens 
   TABLE DATA           B   COPY public.tokens (id, "userId", token, "createdAt") FROM stdin;
    public          postgres    false    212   ?       .          0    16385    users 
   TABLE DATA           G   COPY public.users (id, name, email, password, "createdAt") FROM stdin;
    public          postgres    false    210   '       =           0    0    links_id_seq    SEQUENCE SET     ;   SELECT pg_catalog.setval('public.links_id_seq', 1, false);
          public          postgres    false    213            >           0    0    tokens_id_seq    SEQUENCE SET     ;   SELECT pg_catalog.setval('public.tokens_id_seq', 1, true);
          public          postgres    false    211            ?           0    0    users_id_seq    SEQUENCE SET     :   SELECT pg_catalog.setval('public.users_id_seq', 1, true);
          public          postgres    false    209            ?           2606    16419    links links_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.links
    ADD CONSTRAINT links_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.links DROP CONSTRAINT links_pkey;
       public            postgres    false    214            ?           2606    16403    tokens tokens_pkey 
   CONSTRAINT     P   ALTER TABLE ONLY public.tokens
    ADD CONSTRAINT tokens_pkey PRIMARY KEY (id);
 <   ALTER TABLE ONLY public.tokens DROP CONSTRAINT tokens_pkey;
       public            postgres    false    212            ?           2606    16393    users users_email_key 
   CONSTRAINT     Q   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);
 ?   ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key;
       public            postgres    false    210            ?           2606    16391    users users_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.users DROP CONSTRAINT users_pkey;
       public            postgres    false    210            ?           2606    16420    links links_creatorId_fkey    FK CONSTRAINT        ALTER TABLE ONLY public.links
    ADD CONSTRAINT "links_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES public.users(id);
 F   ALTER TABLE ONLY public.links DROP CONSTRAINT "links_creatorId_fkey";
       public          postgres    false    210    214    3227            ?           2606    16404    tokens tokens_userId_fkey    FK CONSTRAINT     {   ALTER TABLE ONLY public.tokens
    ADD CONSTRAINT "tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id);
 E   ALTER TABLE ONLY public.tokens DROP CONSTRAINT "tokens_userId_fkey";
       public          postgres    false    3227    212    210            2      x?????? ? ?      0   H   x???? ??T?p??!Z?1?	ٕ"%??+??t??ƽ??m?kD?-h ?H??QxUhV"???z      .   z   x?3??)MN,???%??%?z????*FI*?*U?iQ?E?y??.?)ɮ>?????.?A??YFi?z?^?ށn?N?Q?N%N??FFF??F?F?
??V&?V??z?Ff\1z\\\ |7!
     