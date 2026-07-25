# Ofertas Programadas Pro — Resumo do App

App para lojas **Nuvemshop / Tiendanube** que permite criar **campanhas de oferta com início e fim**, controlar **preços promocionais**, e exibir **urgência na loja** com banner, cronômetro e página dedicada.

Nome comercial: **Ofertas Programadas Pro**  
Empresa: **Nimbi**

---

## 1. O que o app resolve

Promoção feita na mão costuma gerar três problemas:

1. Esquecer de ligar ou desligar o preço no horário certo  
2. Campanha sem urgência visual (cliente não sente que “acaba logo”)  
3. Trabalho repetitivo a cada liquidação ou data sazonal  

O Ofertas Programadas Pro concentra isso em um único fluxo: **programar → precificar → publicar na loja → aplicar/restaurar preços automaticamente**.

---

## 2. Como ajuda o e-commerce

| Ganho para o lojista | Como o app contribui |
|----------------------|----------------------|
| Mais urgência de compra | Banner e cronômetro na home, nos cards e na página do produto |
| Menos operação manual | Aplica e restaura preços promocionais no período da oferta |
| Campanhas mais claras | Grupo de oferta com produtos, datas e visual definidos |
| Melhor organização | Página dedicada da campanha e listagem de grupos no admin |
| Controle | Ativar, desativar e editar ofertas sem depender de planilha |

Resultado esperado (qualitativo): promoções mais profissionais, menos risco de preço errado fora do prazo e mais motivo para o cliente decidir agora.

---

## 3. Funcionalidades

### 3.1 Grupo de ofertas
- Nome da campanha  
- Período com data/hora de **início** e **fim**  
- Status derivado: rascunho, agendada, ativa, encerrada ou desativada  
- Ativar / desativar / excluir pelo admin  

### 3.2 Tabela de preços
- Seleção de produtos (manual ou por categoria)  
- Linhas por **variante**  
- Preço original, preço promocional anterior e **preço da oferta**  
- Preenchimento em lote: percentual, valor fixo ou manual  
- Opção de **aplicar/restaurar preços automaticamente** na loja via API Nuvemshop  

### 3.3 Banner na loja
- Barra com textos e cronômetro regressivo  
- Modelos visuais, alinhamento, botão/link, animação e espaçamento  
- Locais na loja (ex.: após o header, antes do conteúdo, seções da home, rodapé)  

### 3.4 Cronômetro de urgência
- Nos **cards de produto** (vitrine/listagens)  
- Na **página do produto (PDP)**  
- Opção de mostrar ou ocultar dias no countdown  
- Modelos e posição configuráveis  

### 3.5 Página dedicada
- Página da campanha na loja (API de páginas / conteúdo)  
- Útil para centralizar a promoção e facilitar o acesso do cliente  

### 3.6 Personalização visual
- Cores e tema da campanha (banner, cronômetros e elementos da oferta)  

### 3.7 Operação e sincronismo
- Sync inteligente de preços: só atualiza produtos quando há mudança real (ativar/desativar, entrar/sair da janela, mudar preço, adicionar/remover itens)  
- Produto removido de um grupo com preços aplicados: preço original é restaurado  
- Cron periódico para ativar/desativar ofertas no horário  

### 3.8 Admin e plataforma
- Interface no admin Enhanced da Nuvemshop (Nimbus + Nexo)  
- Idiomas: **PT-BR** e **ES**  
- Multi-loja via OAuth2  
- Assinatura pelo billing nativo da Nuvemshop (quando o gate de pagamento estiver ativo)  

---

## 4. Possibilidades de uso

Cenários típicos:

- **Liquidação** com prazo definido e countdown na home  
- **Datas sazonais** (Black Friday, Natal, Dia das Mães, etc.)  
- **Campanha relâmpago** de poucas horas ou dias  
- **Lançamento** com preço de introdução programado  
- **Queima de estoque** de um grupo de produtos/variantes  
- **Campanha com landing** (página dedicada + banner + cronômetro na PDP)  

Combinações úteis:

1. Só visual (banner/cronômetro) **sem** alterar preços da loja  
2. Visual + **auto aplicação** de preços promocionais  
3. Campanha completa: preços + banner + countdown + página dedicada  

---

## 5. Tutorial — como usar

### Passo 1 — Instalar
1. No admin da Nuvemshop, instale o **Ofertas Programadas Pro**  
2. Autorize as permissões do app  
3. Abra o app (tela de listagem de ofertas)  

### Passo 2 — Criar um grupo de oferta
1. Clique em **Nova oferta** (ou equivalente)  
2. Defina o **nome** da campanha  
3. Escolha **início** e **fim**  
4. Marque se a oferta deve ficar **ativa**  

### Passo 3 — Montar a tabela de preços
1. Selecione produtos (busca ou categorias)  
2. Ajuste o preço de oferta por variante  
3. Use preenchimento em lote (`%`, valor fixo ou manual) se preferir  
4. Decida se quer **aplicar preços automaticamente** na loja  

> Se a opção de aplicar preços estiver ligada e a oferta estiver na janela ativa, o app atualiza o preço promocional dos itens. Ao encerrar/desativar, restaura os valores anteriores.

### Passo 4 — Configurar a exibição na loja
1. **Banner:** ative, escolha local, modelo, textos, botão/link e cronômetro  
2. **Cronômetro nos cards:** ative e escolha posição/modelo  
3. **Cronômetro na PDP:** ative e escolha posição/modelo  
4. **Página dedicada:** ative se quiser uma página só da campanha  
5. Ajuste as **cores/tema** se necessário  

### Passo 5 — Salvar e publicar
1. Salve a oferta  
2. Se houver mudança de preços em oferta ativa, confirme a aplicação quando o app solicitar  
3. Abra a loja e valide: banner, countdown e preços  

### Passo 6 — Gerenciar no dia a dia
Na listagem de ofertas você pode:

- Ver status (ativa, agendada, encerrada, etc.)  
- Ver se banner / vitrine / PDP estão ligados  
- **Ativar** ou **desativar** um grupo  
- **Editar** ou **excluir**  

Ao desativar ou excluir um grupo com preços aplicados, o app restaura os preços dos produtos envolvidos.

### Passo 7 — Boas práticas
- Teste primeiro com poucos produtos  
- Confira o fuso/horário do período da campanha  
- Use countdown + banner juntos para reforçar urgência  
- Evite duas ofertas ativas alterando o **mesmo** produto/variante ao mesmo tempo  
- Depois da campanha, confirme se os preços voltaram ao esperado  

---

## 6. FAQ

**1. O que o Ofertas Programadas Pro faz?**  
Cria grupos de ofertas com início e fim, preços promocionais e exibição na loja com banner, cronômetro e página dedicada.

**2. Os preços são alterados automaticamente?**  
Sim, quando a opção de aplicar preços estiver ativa. No início da janela (ou ao ativar) aplica o promocional; ao terminar ou desativar, restaura.

**3. Preciso ajustar preços manualmente todo dia?**  
Não. Você programa período e tabela; o app cuida de aplicar e restaurar no momento certo (via salvamento/ações + cron).

**4. Onde o cronômetro aparece?**  
No banner, nos cards de produto e/ou na página do produto, conforme a configuração.

**5. Consigo banner com urgência na home?**  
Sim. Dá para ativar banner com textos, botão/link e cronômetro em locais da loja.

**6. Posso ter uma página só da campanha?**  
Sim. O app pode criar/atualizar uma página dedicada da oferta.

**7. Funciona com variantes?**  
Sim. A tabela trabalha por produto/variante.

**8. Consigo personalizar o visual?**  
Sim. Modelos de banner/cronômetro e cores da campanha.

**9. Serve para quais campanhas?**  
Liquidações, datas sazonais, lançamentos e campanhas relâmpago com prazo definido.

**10. Como começo?**  
Instale no admin Nuvemshop, crie um grupo, defina período e preços, configure banner/cronômetro e salve.

**11. O que acontece se eu remover um produto da oferta?**  
Se os preços daquele grupo já estavam aplicados, o app restaura o preço daquele produto/variante.

**12. O app funciona sem alterar preços da loja?**  
Sim. Você pode usar só a parte visual (banner e cronômetros) deixando a aplicação automática de preços desligada.

---

## 7. Resumo em uma frase

**Ofertas Programadas Pro** ajuda o lojista a programar campanhas com preço certo, urgência na vitrine e menos trabalho manual — do agendamento até o fim da promoção.

---

## 8. Referências técnicas (equipe)

| Item | Detalhe |
|------|---------|
| Admin | Next.js + Nimbus + Nexo |
| Storefront | NubeSDK (`nube-sdk/`) |
| Dados / CDN | Supabase (Postgres + Storage) |
| Host | Vercel |
| Escopos | `write_products`, `write_content`, `write_scripts` |
| Gate de pagamento | `BILLING_ENFORCE` / `PAYMENT_VALIDATION` (`true`/`false`) |
| Cron | Externo (cron-job.org) → `GET/POST /api/cron/offers` + `CRON_SECRET` |

Documentos relacionados:

- [README.md](../README.md)  
- [PLAN.md](../PLAN.md)  
- [oauth-billing.md](./oauth-billing.md)  
