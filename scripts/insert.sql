INSERT INTO public."role"
("name")
VALUES('STUDENT');

INSERT INTO public."role"
("name")
VALUES('LIBRARIAN');

INSERT INTO public."user"
(username, "password")
VALUES('ali', '$2b$10$RkFpmv7BXiefYmlU7RgxlOIgM.lA.YFImp8GIqLNwkdN2ibMmJ6W.');

INSERT INTO public."user"
(username, "password")
VALUES('ahkow', '$2b$10$RkFpmv7BXiefYmlU7RgxlOIgM.lA.YFImp8GIqLNwkdN2ibMmJ6W.');

INSERT INTO public."user"
(username, "password")
VALUES('muthu', '$2b$10$RkFpmv7BXiefYmlU7RgxlOIgM.lA.YFImp8GIqLNwkdN2ibMmJ6W.');

INSERT INTO public."user"
(username, "password")
VALUES('david', '$2b$10$RkFpmv7BXiefYmlU7RgxlOIgM.lA.YFImp8GIqLNwkdN2ibMmJ6W.');

INSERT INTO public.user_role
(role_id, user_id)
VALUES(1, 1);

INSERT INTO public.user_role
(role_id, user_id)
VALUES(1, 2);

INSERT INTO public.user_role
(role_id, user_id)
VALUES(1, 3);

INSERT INTO public.user_role
(role_id, user_id)
VALUES(2, 4);


INSERT INTO public.book
(isbn, title, author, qty)
VALUES('9780072119763', 'java', 'ben hopkins', 50);

INSERT INTO public.book
(isbn, title, author, qty)
VALUES('9780321121745', 'php', 'kenny roger', 40);

INSERT INTO public.book
(isbn, title, author, qty)
VALUES('9781568843308', 'html', 'susan', 30);
