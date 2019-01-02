# -*- coding: cp1252 -*-
# Embora as bibliotecas utilizadas estejam explicadas nas aulas dadas,
# seguem os links complementares das mesmas:
# https://docs.python.org/2/library/webbrowser.html
# https://docs.python.org/2/library/os.html
# https://www.tutorialspoint.com/python/python_reg_expressions.htm

import webbrowser
import os
import re

from media import get_movie_instances
from conteudo import main_page_head, main_page_content, movie_tile_content

# A função create_movie_tile_content monta o vídeo extraído do youtube
# segundo os dados montados pela classe movie e importados de get_move_instances.
# criando assim cada um dos ícones (ainda por carregar) utilizados na página.
# O (r') + ([^&#]+) visam ler literalmente os códigos dos vídeos carregados
# no youtube, sem que o python faça qualquer tradução erronêa de caracteres.
# (?<=...) este código é o Lookbehind positivo que lerá o código do vídeo
# no youtube, ou seja (https://www.youtube.com/watch?v=...) o que vem após o v.
# ou então, para links reduzidos, onde o código vem após o be (youtu.be/...)
# referências:
# (https://docs.python.org/2/library/re.html)
# (https://pt.stackoverflow.com/questions/13598/significado-de-em-uma-regex)
# (https://docs.python.org/3/reference/lexical_analysis.html#literals)

def create_movie_tiles_content(movies):
    content = ''
    for movie in movies:
        youtube_id_match = re.search(
            r'(?<=v=)[^&#]+', movie.trailer_youtube_url)
        youtube_id_match = youtube_id_match or re.search(
            r'(?<=be/)[^&#]+', movie.trailer_youtube_url)
        trailer_youtube_id = (youtube_id_match.group(0)
                              if youtube_id_match
                              else None)
        content = movie_tile_content.format(
            movie_title=movie,
            poster_image_url=movie.poster_image_url,
            trailer_youtube_id=trailer_youtube_id,
            storyline=movie.storyline,
            ) + content
    return content

# A função open_movies_page monta o arquivo pagina.html a partir da estrutura
# do arquivo conteudo e insere os dados pré-montados pela função
# create_movie_tiles_content
# o comando os.path.abspath cria uma variável absoluta contendo o caminho local 
# para que o webbrowser.open possa buscar o pagina.html localmente.
# (http://www.diveintopython.net/functional_programming/finding_the_path.html)

def open_movies_page(movies):
    output_file = open('pagina.html', 'w')
    rendered_content = main_page_content.format(
        movie_tiles=create_movie_tiles_content(movies))
    output_file.write(main_page_head + rendered_content)
    output_file.close()
    url = os.path.abspath(output_file.name)
    webbrowser.open('file://' + url, new=2)

if __name__ == "__main__":
    open_movies_page(get_movie_instances())
