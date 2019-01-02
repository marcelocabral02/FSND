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

# A fun��o create_movie_tile_content monta o v�deo extra�do do youtube
# segundo os dados montados pela classe movie e importados de get_move_instances.
# criando assim cada um dos �cones (ainda por carregar) utilizados na p�gina.
# O (r') + ([^&#]+) visam ler literalmente os c�digos dos v�deos carregados
# no youtube, sem que o python fa�a qualquer tradu��o erron�a de caracteres.
# (?<=...) este c�digo � o Lookbehind positivo que ler� o c�digo do v�deo
# no youtube, ou seja (https://www.youtube.com/watch?v=...) o que vem ap�s o v.
# ou ent�o, para links reduzidos, onde o c�digo vem ap�s o be (youtu.be/...)
# refer�ncias:
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

# A fun��o open_movies_page monta o arquivo pagina.html a partir da estrutura
# do arquivo conteudo e insere os dados pr�-montados pela fun��o
# create_movie_tiles_content
# o comando os.path.abspath cria uma vari�vel absoluta contendo o caminho local 
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
