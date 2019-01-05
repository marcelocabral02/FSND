# FSND - MLAC - P6_SERVER_AWS - Udacity

## Catalogo de sobressalentes para composição de base de dados em engenharia.
**************************
## Aplicações necessárias:
**************************
### Python (apt-get install python)

Python 2.7 com as aplicações abaixo:
1. Flask (python -m pip install Flask)
2. sqlalchemy (python -m pip install sqlalchemy)
3. oauth2client.client (python -m pip install oauth2client)
4. httplib2 (python -m pip install httplib2)
5. requests (python -m pip install requests)

### PIP

>curl "https://bootstrap.pypa.io/get-pip.py" -o 
"get-pip.py"

>python get-pip.py

verifique as versões do pip setuptolls e wheels instalados.
>pip list

verifique a integridade do pip.
>pip check


### Pacotes adicionais ao Ubuntu:

1. Tree (apt-get install tree)
	>facilita a visualização das pastas
2. Pycodestyle (apt-get install pycodestyle)
	>agiliza a correção do código no ambiente
	 que será usado (não dispensa o Git Commit)
3. Postgresql
	>O banco de dados será migrado do sql lite para o postgresql.
	#### (apt-get install postgresql)
	#### (https://www.postgresql.org/download/linux/ubuntu/)
	#### (python -m pip install psycopg2)
4. Apache 2 (apt-get install apache2)

Após instalados os pacotes acima, devemos proceder:

1. apt-get update
2. apt-get upgrade

****************************
## Criação do usuário grader
****************************
Atualizada a instancia, faremos a criação do usuário grader
>$ sudo adduser grader'

atribua uma senha a ele

OBS:
O usuário original da instância é o ubuntu. O usuário ubuntu originalmente vem sem senha, então, como sugestão, atribua uma senha ao usuário ubuntu (usuário original) diferente (e mais forte) do usuário grader para servir de backdoor em caso de falha na configuração do grader.
Para atribuir a senha, use o comando:
>'home/ubuntu#passwd ubuntu'

> new password: XXXXXXX

verifique as senhas modificadas em /etc/shadow, onde elas terão um formato:
>ubuntu:$6$KUhC64qi$q ... 9999:7:::

>grader:$6$S/AU2rzm$C ... 9999:7:::

ao invés de "*:17786:0.." para os dois usuários;

Acrescente o usuário grader na lista de root:

>root@ip-xxx-xxx-xxx-xxx:/etc/sudoers.d# nano /etc/sudoers

>$ sudo User privilege specification
'root    ALL=(ALL:ALL) ALL
'ubuntu  ALL=(ALL:ALL) ALL
'grader  ALL=(ALL:ALL) ALL

>root@ip-xxx-xxx-xxx-xxx:/etc/sudoers.d# nano 90-cloud-init-users
'# Created by cloud-init v. 18.3-9-g2e62cb8a-0ubuntu1~18.04.2
'# User rules for ubuntu
ubuntu ALL=(ALL) NOPASSWD:ALL
grader ALL=(ALL) NOPASSWD:ALL

*****************
## Conexão remota
*****************

Garantidos os usuários, vamos estabelecer as condições de conexão remota:

1. Na pasta /home/grader/.ssh gere uma chave SSH pública (key.pub) e remeta ao usuário que fará acesso a esta instância
> ssh-keygen

Obs1: O critério de envio desta chave é de livre escolha de quem criou e deve se basear no grau de segurança que julgar necessário.
Obs2: A chave também pode ser gerada na máquina remota e remetida para a instância (foi o meu caso).
Obs3: Por coerência a sugestão de se manter um backdoor,copie a chave gerada em um usuário no outro usuário, assim, ambos terão acesso SSH.
> 'home/user/.ssh# cp key.pub /home/ubuntu/.ssh

2. verifique o firewall:
> ufw status

	Certificado de que este está inoperante, vamos as configurações:
>$ sudo ufw allow 2200/tcp

>$ sudo ufw allow www

>$ sudo ufw allow 8080/tcp

>$ sudo ufw allow 443/tcp

>$ sudo ufw allow ntp

> ufw show

> ufw enable

Pronto! Firewall habilitado para operar as conexões de acesso web e pela porta SSH especificada.

3. Modificar a porta SSH:

> $ sudo nano /etc/ssh/sshd_config

A única alteração feita foi alterar de port 22 para port 2200 e esta é a única configuração habilitada (descomentada).

Obs: por garantia, só mude a porta após ter certeza de que a chave pub do seu terminal e da instância são idênticas, o firewall está ok no lightsail, no UFW e no terminal que você utilizará. caso contrário, o acesso a instância se perderá e não  haverá meio de acesso nem mesmo pelo lightsail. 
************
## front-end
************
Instalar o Apache2, libapache2-mod-wsgi, o python set up tools packages e reiniciar o Apache service.

> $ sudo apt-get install apache2

> $ sudo apt-get install libapache2-mod-wsgi

> $ sudo apt-get install python-setuptools

> $ sudo service apache2 restart

Feita a instalação, crie o arquivo FlaskApp.conf na pasta '/etc/apache2/sites-available/flaskapp.conf'

>  $ sudo nano/etc/apache2/sites-available/flaskapp.conf 

Criado o Arquivo, insira as seguintes informações nele:
>  $ sudo nano/etc/apache2/sites-available/flaskapp.conf 

<!-- <VirtualHost *:80>
		ServerName 34.202.95.58
		ServerAdmin 'your_email'@gmail.com
		WSGIScriptAlias / /var/www/FlaskApp/FlaskApp.wsgi
		<Directory /var/www/FlaskApp/FlaskApp/>
			Order allow,deny
			Allow from all
		</Directory>
		Alias /static /var/www/FlaskApp/FlaskApp/static
		<Directory /var/www/FlaskApp/FlaskApp/static/>
			Order allow,deny
			Allow from all
		</Directory>
		ErrorLog ${APACHE_LOG_DIR}/error.log
		LogLevel warn
		CustomLog ${APACHE_LOG_DIR}/access.log combined
</VirtualHost> -->

Crie uma pasta para hospedar o site:

>$ mkdir /var/www/FlaskApp

Crie o flaskapp.wsgi em /var/www/FlaskApp', cuja pasta também foi criada por você, e insira o seguinte:

<!-- #!/usr/bin/python
import sys
import logging
logging.basicConfig(stream=sys.stderr)
sys.path.insert(0,"/var/www/FlaskApp/")

from catalog import app as application
application.secret_key = 'super_secret_key' -->

*******************
## conteúdo do site
*******************

Realizadas estas etapas, vamos baixar o site:

1. Instalar o git
> $ sudo apt-get install git-all

2. Vamos criar o diretório .git na pasta /var/www/FlaskApp
> $ sudo git init

3. Download do site:
>/var/www/FlaskApp# git clone"https://github.com/'YOUR_USER'/'pasta'"

************
## Relógio
************

Atualização do relógio:
>$ sudo dpkg-reconfigure tzdata

Seguindo orientação da documentação de projeto, o relógio deverá ser configurado para UTC.

*****************
## Banco de dados
*****************

Instalação e configuração do postgreSql:

$ sudo apt-get install postgresql
$ sudo nano /etc/postgresql/9.5/main/pg_hba.conf

>$ sudo su - postgres

>postgres $ psql
>postgres=# CREATE DATABASE SpareParts;

>'# CREATE USER spareparts;

>'# ALTER ROLE spareparts WITH PASSWORD 'spareparts'

>'# GRANT ALL PRIVILEGES ON DATABASE spareparts TO spareparts;

*************************
## alterações do conteúdo
*************************

configurado o postgreSQL e baixado o site, faremos as seguintes modificações:
O arquivo *.py usado para ativar o site (o meu era main.py) será alterado para __init__.py.
> var/www/FlaskApp$ sudo mv main.py __init__.py

o endereçamento do BD que era SQLite passará para:
>$ sudo nano __init__.py

>'postgresql://spareparts:spareparts@localhost/spareparts'

Altere os privilégios dos arquivos utilizados, onde:

> /var/www/FlaskApp$ sudo chmod 700 .ssh

> /var/www/FlaskApp$ sudo chmod 700 __init__.py

> /var/www/FlaskApp$ sudo chmod 700 SpareParts.py

> /var/www/FlaskApp$ sudo chmod 700 database.py

> /var/www/FlaskApp$ sudo chmod 700 flaskapp.wsgi

> /var/www/FlaskApp$ sudo chmod 700 .ssh

> /var/www/FlaskApp/static/js$ sudo chmod 700 app.js

> /var/www/FlaskApp/static/mdl$ sudo chmod 700 material.js

> /var/www/FlaskApp$ sudo chmod 644 .ssh/authorized_keys

*******************
## Ativação do site
*******************


A execução do arquivo __init__.py iniciará o servidor em segundo plano e sua exibição se dará pelo endereço:
>http://ec2-34-202-95-58.compute-1.amazonaws.com
	
*******************
## Recursos
*******************
Modelo de referência 1:
>https://www.digitalocean.com/community/tutorials/how-to-deploy-a-flask-application-on-an-ubuntu-vps

Modelo de referência 2:
>https://github.com/kongling893/Linux-Server-Configuration-UDACITY/blob/master/README.md

Conteúdo:
>https://github.com/marcelocabral02/FSND/tree/master/FSND_MLAC_P4_Item_catalog_4

Automatização de atualizações:
>https://help.ubuntu.com/lts/serverguide/automatic-updates.html

Configuração de atualizações:
>https://serverfault.com/questions/262751/update-ubuntu-10-04/262773#262773