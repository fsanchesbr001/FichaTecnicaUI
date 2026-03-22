Agindo como um desenvolvedor Angular, aqui estão as diretrizes que devem ser seguidas
para você conseguir fazer a ligação do frontend com o backend:

01-Unidades de Medida

De quais partes estamos tratando:
- Lista de Medidas (lista-unidades)
- Formulário de Medidas (formulario-unidades)

Quais endpoints estão disponíveis no backend para cada parte:
- Lista de Medidas:
  - GET http://localhost:8080/ficha-tecnica/unidades-medida - Lista todas as unidades de medida 
  cadastradas.
  - DELETE http://localhost:8080/ficha-tecnica/unidades-medida/{id} - Exclui uma unidade de 
  medida pelo ID.
  - GET http://localhost:8080/ficha-tecnica/unidades-medida/gerar-pdf-lista - Gera um PDF com a 
  lista de todas as unidades de medida cadastradas.

- Formulário de Medidas:
  - POST http://localhost:8080/ficha-tecnica/unidades-medida - Cria uma nova unidade de medida. 
  O corpo da requisição deve conter os dados da unidade de medida
  - PUT http://localhost:8080/ficha-tecnica/unidades-medida/{id} - Atualiza uma unidade de 
  medida existente pelo ID. O corpo da requisição deve conter os dados atualizados da unidade 
  de medida.
  - GET /ficha-tecnica/unidades-medida/gerar-pdf-detalhe/{id} - Gera um PDF detalhado de uma 
  unidade de medida específica pelo ID.

Apresentar os dados no frontend:
- Lista de Medidas:
  - Para a Lista de Medidas, utilize o endpoint GET para buscar os dados e exibi-los em uma 
  tabela ou lista. 
  - Implemente a funcionalidade de exclusão utilizando o endpoint DELETE
  - Implemente a funcionalidade de geração de PDF utilizando o endpoint 
  GET para gerar o PDF da lista completa.

- Formulário de Medidas:
  - Para o Formulário de Medidas, utilize os endpoints POST e PUT para criar e atualizar 
  as unidades de medida, respectivamente.
  - Implemente a funcionalidade de geração de PDF detalhado utilizando o endpoint GET para 
  gerar o PDF de uma unidade de medida específica.
  
02-Conversão

De quais partes estamos tratando:
- Lista de Conversões (lista-conversoes)
- Formulário de Conversões (formulario-conversoes)

Quais endpoints estão disponíveis no backend para cada parte:
- Lista de Conversões:
  - GET http://localhost:8080/ficha-tecnica/conversoes - Lista todas as conversões cadastradas.
  - DELETE http://localhost:8080/ficha-tecnica/conversoes/{id} - Exclui uma conversão pelo ID.
  - GET http://localhost:8080/ficha-tecnica/conversoes/gerar-pdf-lista - Gera um PDF com a lista
  de todas as conversões cadastradas.

- Formulário de Conversões:
  - POST http://localhost:8080/ficha-tecnica/conversoes - Cria uma nova conversão. O corpo da 
  requisição deve conter os dados da conversão.
  - PUT http://localhost:8080/ficha-tecnica/conversoes/{id} - Atualiza uma conversão existente pelo 
  ID. O corpo da requisição deve conter os dados atualizados da conversão.
  - GET /ficha-tecnica/conversoes/gerar-pdf-detalhe/{id} - Gera um PDF detalhado de uma 
  conversão específica pelo ID.

Apresentar os dados no frontend:
- Lista de Conversões:
  - Para a Lista de Conversões, utilize o endpoint GET para buscar os dados e exibi-los em 
  uma tabela ou lista. 
  - Implemente a funcionalidade de exclusão utilizando o endpoint DELETE
  - Implemente a funcionalidade de geração de PDF utilizando o endpoint GET para gerar o PDF 
  da lista completa.
  
- Formulário de Conversões:
  - Para o Formulário de Conversões, utilize os endpoints POST e PUT para criar e atualizar as conversões, respectivamente.
  - Implemente a funcionalidade de geração de PDF detalhado utilizando o endpoint GET para gerar o PDF de uma conversão específica.

Com relação a apresentação dos dados, certifique-se de que os dados retornados pelo backend
sejam exibidos de forma clara e organizada no frontend. 
Todas as telas tentam seguir um padrão de layout, com um menu lateral para navegação e uma 
seção principal para exibição dos dados.
A parte de Usuários ou Unidade de Medida do sistema encontra-se funcionando como planejado 
e pode ser usada como referência para a implementação, seguindo o mesmo padrão de chamadas ao
backend e apresentação dos dados.
