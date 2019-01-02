# -*- coding: cp1252 -*-

import json

# A classe movie, visa montar a sequência de dados ordenados que
# serão utilizados em get_movie_instances, mais abaixo,
# e que serão remetidos ao fresh_tomatoes.
# As funções _str_ e _unicode_ visam compatibilizar este código a
# qualquer python utilizado e só constam para evitar qualquer
# possibilidade de erro, contudo somente o _unicode_ bastaria. Vide
# (https://pt.stackoverflow.com/questions/207493/m%C3%A9todos-str-e
# -unicode).
# Particularmente, como eu não utilizei uma API e não implementei
# nenhum direcionamento a frameworks python, eles poderiam ser
# removidos, (inclusive o fresh_tomatoes roda sem eles)
# O campo IMDb citado no _init_ visava incluir a nota IMDb, obtida em:
# www.imdb.org
# Esta medida visava compensar o não uso da API, assim evitando a
# exposição de dados sensíveis
# Por fim, acreditei que era um dado desnecessário e resolvi removê-lo
# e curiosamente, a sua saída gera erro ao fresh_tomatoes original.


class Movie():
    def __init__(self, title, storyline, poster, yt_trailer, IMDb):
        self.title = title
        self.storyline = storyline
        self.poster_image_url = poster
        self.trailer_youtube_url = yt_trailer

    def __str__(self):
        return self.title

    def __unicode__(self):
        return self.title

# A função get_movies visa buscar os filmes listados em movies.json,
# sem traduções de strings ('r'), conforme explicado em aula
# Lição 5, aula 21 e complementado pelo link abaixo.
# https://stackoverflow.com/questions/2081640/what-exactly-do-u-and
# -r-string-flags-do-and-what-are-raw-string-literals


def get_movies():
    movies_file = open('movies.json', 'r').read()
    return json.loads(movies_file)

# A função get_movie_instances cria a lista de filmes, adicionando-os
# em ordem (.append) e exibindo-os pela função open_movies_page em
# fresh_tomatoes.


def get_movie_instances():
    movies = []
    for movie in get_movies():
        movies.append(Movie(movie[0], movie[1], movie[2], movie[3], movie[4]))
    return movies
