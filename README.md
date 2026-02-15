# revenda-veiculos-api

API NestJS do MVP da plataforma de revenda de veiculos.

## Tecnologias

- NestJS
- TypeScript
- PostgreSQL
- AWS Cognito (integracao de autenticacao separada)
- TypeORM

## Endpoints MVP

- `GET /v1/health`
- `GET /v1/vehicles`
- `GET /v1/vehicles/sold`
- `GET /v1/vehicles/:id`
- `POST /v1/vehicles`
- `PATCH /v1/vehicles/:id`
- `POST /v1/vehicles/upload-image`
- `POST /v1/sales`
- `GET /v1/sales/my-purchases`

## Como rodar local

```bash
npm ci
cp .env.example .env
npm run migration:run
npm run start:dev
```

API local: `http://localhost:3000/v1`
Swagger local: `http://localhost:3000/v1/docs`

## Swagger (OpenAPI)

A API expoe documentacao interativa via Swagger com:

- descricoes de cada endpoint
- exemplos de request/payload
- exemplos de response por recurso
- codigos de retorno por cenario (sucesso, validacao, nao encontrado, conflito, nao autorizado)
- autenticacao JWT Bearer para endpoints protegidos

Para testar endpoints protegidos no Swagger:

1. Clique em **Authorize**.
2. Informe: `Bearer <COGNITO_ID_TOKEN>`.
3. Execute os endpoints de `sales` normalmente pela UI.

## Primeira execucao local (passo a passo)

Use este fluxo na primeira vez para subir sem erros:

1. Pre-requisitos:
   - Node.js 20+
   - Docker Desktop ativo
2. Suba o banco Postgres local:

```bash
docker compose up -d
```

3. Instale dependencias e configure ambiente:

```bash
npm ci
cp .env.example .env
```

4. Revise o `.env` (principalmente `DATABASE_URL` e `COGNITO_*`).
5. Execute as migrations:

```bash
npm run migration:run
```

6. (Opcional, recomendado para demo) Popule dados de exemplo:

```bash
npm run seed:demo
```

7. Suba a API:

```bash
npm run start:dev
```

8. Valide saude:

```bash
curl http://localhost:3000/v1/health
```

9. Acesse a documentacao Swagger:

```bash
open http://localhost:3000/v1/docs
```

## Scripts principais

- `npm run lint`
- `npm run test`
- `npm run test:e2e`
- `npm run build`
- `npm run migration:run`
- `npm run migration:revert`
- `npm run seed:demo`

## Como testar (automacao)

```bash
npm run lint
npm run test -- --runInBand
npm run test:e2e
npm run build
```

Os testes E2E cobrem os fluxos principais:

- cadastrar veiculo
- editar veiculo
- listar disponiveis ordenado por preco
- comprar veiculo
- listar vendidos ordenado por preco
- consultar historico de compras

## Como testar (manual fim-a-fim)

1. Configure `.env` com `DATABASE_URL` e variaveis `COGNITO_*`.
2. Execute `npm run migration:run`.
3. Suba a API com `npm run start:dev`.
4. (Opcional) Popule dados de demo:

```bash
npm run seed:demo
```

5. Teste cadastro e edicao:

```bash
curl -X POST http://localhost:3000/v1/vehicles \
  -H "Content-Type: application/json" \
  -d '{"brand":"Fiat","model":"Mobi","year":2022,"color":"Branco","price":55000}'

curl -X PATCH http://localhost:3000/v1/vehicles/<VEHICLE_ID> \
  -H "Content-Type: application/json" \
  -d '{"color":"Vermelho","price":53000}'
```

6. Teste compra e historico com token Cognito:

```bash
curl -X POST http://localhost:3000/v1/sales \
  -H "Authorization: Bearer <COGNITO_ID_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"vehicleId":"<VEHICLE_ID>"}'

curl http://localhost:3000/v1/sales/my-purchases \
  -H "Authorization: Bearer <COGNITO_ID_TOKEN>"
```

## CI/CD

- CI: `.github/workflows/ci.yml`
  - lint + testes + build em `pull_request` e `push` na `main`
- CD: `.github/workflows/cd.yml`
  - build e push da imagem Docker para ECR
  - trigger de deploy no ECS service

## IaC local do repositorio

- Pasta: `iac/terraform`
- Recursos iniciais:
  - ECR repository
  - ECS cluster
  - CloudWatch log group

Exemplo:

```bash
cd iac/terraform
terraform init
terraform plan \
  -var="db_password=<senha_forte>" \
  -var="cors_origin=http://localhost:5173" \
  -var="cognito_region=us-east-1" \
  -var="cognito_user_pool_id=us-east-1_xxxxxxxxx" \
  -var="cognito_client_id=xxxxxxxxxxxxxxxxxxxx"
terraform apply \
  -var="db_password=<senha_forte>" \
  -var="cors_origin=http://localhost:5173" \
  -var="cognito_region=us-east-1" \
  -var="cognito_user_pool_id=us-east-1_xxxxxxxxx" \
  -var="cognito_client_id=xxxxxxxxxxxxxxxxxxxx"
```

O Terraform da API provisiona (escopo challenge):

- ECR repository
- ECS cluster + task definition + service (Fargate)
- ALB publico com health check em `/v1/health`
- CloudWatch log group
- RDS PostgreSQL

## Deploy automatizado (GitHub Actions)

Pipeline `cd.yml` da API (push em `main`) faz:

1. build da imagem Docker
2. push para ECR (`sha` e `latest`)
3. criacao de nova revisao da task definition com a imagem nova
4. update do ECS service e espera de estabilidade

### GitHub Secrets e Variables necessarios (API)

Secrets:

- `AWS_GITHUB_ROLE_ARN`

Variables:

- `AWS_REGION`
- `API_ECR_REPOSITORY`
- `API_ECS_CLUSTER`
- `API_ECS_SERVICE`
- `API_CONTAINER_NAME`

### Rollback rapido (API)

- Pelo ECS, selecione a revisao anterior da task definition e rode novo deploy do service.
- Alternativamente, reexecute o CD com um commit/tag anterior.

## Variaveis de ambiente

Confira `.env.example` para os valores necessarios da API e do Cognito.
