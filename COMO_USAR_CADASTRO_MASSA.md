# Cadastro em Massa de Usuários

Este sistema permite cadastrar até 1357 usuários em massa a partir de um arquivo Excel.

## 📋 Pré-requisitos

1. Python 3.x instalado
2. Dependências instaladas:
   ```bash
   pip install openpyxl
   ```

## 📊 Formato do Arquivo Excel

### Colunas Obrigatórias:
- `username` - Nome de usuário único (ex: joao.silva)
- `email` - E-mail válido

### Colunas Opcionais:
- `first_name` - Primeiro nome
- `last_name` - Último nome
- `role` - Perfil do usuário (padrão: cliente_orcoma)
- `empresa` - Nome da empresa
- `cnpj` - CNPJ da empresa (formato: 12.345.678/0001-90)
- `telefone` - Telefone corporativo
- `cargo` - Cargo/função
- `unidade` - Unidade Orcoma (ver planilha "Unidades Válidas")
- `regime_federal` - Regime tributário (mei, me, epp)
- `is_empresario` - Se é empresário (True/False)

## 🎯 Roles Válidas

Consulte a planilha "Roles Válidas" no template para ver todas as opções:
- `admin` - Administrador
- `cliente_premium` - Cliente Premium
- `cliente_orcoma` - Cliente Orcoma (padrão)
- `empresario` - Empresário Não Cliente
- `cliente_equipe` - Cliente Equipe
- `colaborador_orcoma` - Colaborador Orcoma
- `gestor_orcoma` - Gestor Orcoma (interno)
- `visitor` - Visitante

## 🚀 Como Usar

### 1. Gerar Template (Opcional)
```bash
python backend/gerar_template_excel.py
```
Isso criará o arquivo `template_usuarios_massa.xlsx` com exemplos.

### 2. Preparar Arquivo de Entrada
- Abra o template ou crie um novo arquivo Excel
- Preencha os dados dos usuários na planilha "Usuários"
- **Importante**: Não altere os nomes das colunas da primeira linha

### 3. Executar Cadastro em Massa
```bash
python manage.py cadastrar_usuarios_massa --arquivo=caminho/para/arquivo.xlsx
```

#### Parâmetros Opcionais:
- `--planilha=NomeDaPlanilha` - Nome da planilha (padrão: Sheet1)

### 4. Exemplo de Uso
```bash
# Com planilha padrão
python manage.py cadastrar_usuarios_massa --arquivo=clientes.xlsx

# Com planilha customizada
python manage.py cadastrar_usuarios_massa --arquivo=clientes.xlsx --planilha=MinhaPlanilha
```

## 📄 Arquivo de Saída

Após o cadastro, será gerado um arquivo Excel com o nome:
```
relatorio_usuarios_cadastrados_YYYYMMDD_HHMMSS.xlsx
```

Este arquivo contém:
- Username
- Email
- **Senha** (gerada automaticamente)
- Role
- Empresa
- Status

## 🔐 Senhas

As senhas são geradas automaticamente no formato:
```
Nome.Sobrenome@123
```

Exemplos:
- João Silva → `joao.silva@123`
- Maria Souza → `maria.souza@123`

**IMPORTANTE**: Distribua o arquivo de relatório com as senhas para os usuários.

## ⚙️ Funcionalidades Automáticas

1. **Validação de dados**: Verifica se username/email estão preenchidos
2. **Duplicatas**: Ignora usuários que já existem no sistema
3. **Validação de roles**: Apenas roles válidas são aceitas
4. **Atribuição de planos**: Se o CNPJ existir nas regras de atribuição, o plano é automaticamente associado
5. **Criação de perfil**: O perfil é criado automaticamente com todos os dados

## 📝 Exemplo de Arquivo de Entrada

```
username,email,first_name,last_name,role,empresa,cnpj,telefone,cargo,unidade,regime_federal,is_empresario
joao.silva,joao@empresa.com,João,Silva,cliente_orcoma,Empresa ABC,12.345.678/0001-90,(11)98765-4321,Analista,sao_paulo,mei,True
maria.souza,maria@empresa.com,Maria,Souza,empresario,Empresa XYZ,98.765.432/0001-10,(11)91234-5678,Diretora,salvador,me,True
pedro.costa,pedro@empresa.com,Pedro,Costa,cliente_equipe,Empresa 123,11.222.333/0001-44,(11)99999-8888,Gerente,maracas,,False
```

## ⚠️ Observações

- O arquivo Excel de entrada deve ter extensão `.xlsx`
- A primeira linha deve conter os cabeçalhos das colunas
- Usuários duplicados são ignorados (não geram erro)
- Roles inválidas geram aviso e o usuário não é cadastrado
- O processo pode demorar dependendo da quantidade de usuários
- Para 1357 usuários, o processo deve levar alguns minutos

## 🆘 Problemas Comuns

### Erro: "Arquivo não encontrado"
- Verifique se o caminho do arquivo está correto
- Use caminho absoluto ou relativo a partir da pasta `backend`

### Erro: "Colunas obrigatórias não encontradas"
- Verifique se as colunas `username` e `email` existem na primeira linha
- Os nomes devem estar em inglês (case-sensitive)

### Erro: "Role inválida"
- Consulte a planilha "Roles Válidas" no template
- Use exatamente os valores da coluna "Role"

### Erro: "openpyxl não encontrado"
```bash
pip install openpyxl
```

## 📞 Suporte

Em caso de dúvidas, consulte:
- Template: `backend/template_usuarios_massa.xlsx`
- Script: `backend/core/management/commands/cadastrar_usuarios_massa.py`
- Gerador de template: `backend/gerar_template_excel.py`