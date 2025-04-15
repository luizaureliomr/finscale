# Configuração do PATH para PostgreSQL no Windows

Para adicionar o PostgreSQL ao PATH do Windows, siga estas etapas:

1. Pressione a tecla Windows + R para abrir a caixa de diálogo Executar
2. Digite `sysdm.cpl` e pressione Enter para abrir as Propriedades do Sistema
3. Vá para a aba "Avançado"
4. Clique no botão "Variáveis de Ambiente" na parte inferior
5. Na seção "Variáveis do sistema", procure e selecione a variável "Path" e clique em "Editar"
6. Clique em "Novo" e adicione o caminho para o diretório `bin` do PostgreSQL:
   - Tipicamente: `C:\Program Files\PostgreSQL\14\bin` (ajuste o número da versão se necessário)
7. Clique em "OK" para fechar todas as janelas

Agora abra um novo prompt de comando (você precisa abrir um novo prompt para que as alterações no PATH sejam aplicadas) e digite:

```
psql --version
```

Isso deve mostrar a versão do PostgreSQL, confirmando que a configuração está correta.

### Alternativa: Usar o caminho completo

Se você não quiser modificar o PATH do sistema, pode acessar o PostgreSQL usando o caminho completo:

```
"C:\Program Files\PostgreSQL\14\bin\psql" --version
```

Ajuste o número da versão e o caminho conforme necessário para sua instalação. 