-- public."role" definition

-- Drop table

-- DROP TABLE public."role";

CREATE TABLE public."role" (
	id serial4 NOT NULL,
	"name" varchar(100) NOT NULL,
	CONSTRAINT role_name_key UNIQUE (name),
	CONSTRAINT role_pkey PRIMARY KEY (id)
);
CREATE INDEX role_name_d257ae6b_like ON public.role USING btree (name varchar_pattern_ops);

-- public."user" definition

-- Drop table

-- DROP TABLE public."user";

CREATE TABLE public."user" (
	id serial4 NOT NULL,
	username varchar(150) NOT NULL,
	"password" varchar(130) NOT NULL,
	CONSTRAINT user_pkey PRIMARY KEY (id),
	CONSTRAINT user_username_key UNIQUE (username)
);
CREATE INDEX user_username_cf016618_like ON public."user" USING btree (username varchar_pattern_ops);

-- public.user_role definition

-- Drop table

-- DROP TABLE public.user_role;

CREATE TABLE public.user_role (
	id serial4 NOT NULL,
	role_id int4 NOT NULL,
	user_id int4 NOT NULL,
	CONSTRAINT user_role_pkey PRIMARY KEY (id)
);
CREATE INDEX user_role_role_id_6a11361a ON public.user_role USING btree (role_id);
CREATE INDEX user_role_user_id_12d84374 ON public.user_role USING btree (user_id);


-- public.user_role foreign keys

ALTER TABLE public.user_role ADD CONSTRAINT user_role_role_id_6a11361a_fk_role_id FOREIGN KEY (role_id) REFERENCES public."role"(id) DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE public.user_role ADD CONSTRAINT user_role_user_id_12d84374_fk_user_id FOREIGN KEY (user_id) REFERENCES public."user"(id) DEFERRABLE INITIALLY DEFERRED;

-- public.book definition

-- Drop table

-- DROP TABLE public.book;

CREATE TABLE public.book (
	id serial4 NOT NULL,
	title varchar(200) NOT NULL,
	author varchar(200) NOT NULL,
	qty int4 NOT NULL,
	isbn varchar(100) NOT NULL,
	CONSTRAINT book_pkey PRIMARY KEY (id),
	CONSTRAINT book_qty_check CHECK ((qty >= 0))
);

-- public.books_borrow definition

-- Drop table

-- DROP TABLE public.books_borrow;

CREATE TABLE public.books_borrow (
	id serial4 NOT NULL,
	has_renew bool NOT NULL,
	start_date timestamp NOT NULL,
	end_date timestamp NOT NULL,
	return_date timestamp NULL,
	book_id int4 NOT NULL,
	user_id int4 NOT NULL,
	CONSTRAINT books_borrow_pkey PRIMARY KEY (id)
);
CREATE INDEX books_borrow_book_id_004b32b4 ON public.books_borrow USING btree (book_id);
CREATE INDEX books_borrow_user_id_4d52cd18 ON public.books_borrow USING btree (user_id);


-- public.books_borrow foreign keys

ALTER TABLE public.books_borrow ADD CONSTRAINT books_borrow_book_id_004b32b4_fk_book_id FOREIGN KEY (book_id) REFERENCES public.book(id) DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE public.books_borrow ADD CONSTRAINT books_borrow_user_id_4d52cd18_fk_user_id FOREIGN KEY (user_id) REFERENCES public."user"(id) DEFERRABLE INITIALLY DEFERRED;
