# 🔴 PROBLEMA CRÍTICO: Referência Circular no Backend

## O Problema

O backend está retornando JSON malformado com **1.2 MB** devido a **referências circulares** nos relacionamentos JPA:

```
Contrato → MetodoPagamento → Contrato → MetodoPagamento → Contrato → ...
(loop infinito ao serializar)
```

## Sintomas

- ✅ Backend retorna status 200 (sucesso)
- ❌ JSON está quebrado/malformado
- ❌ Erro: `SyntaxError: Expected ':' after property name in JSON at position 1243714`
- ❌ Frontend não consegue fazer parse

## Solução no Backend

### Opção 1: Usar @JsonManagedReference e @JsonBackReference (Recomendado)

**No modelo Contrato.java:**
```java
@Entity
public class Contrato extends BaseEntity {
    // ... outros campos ...

    @OneToMany(mappedBy = "contrato")
    @JsonManagedReference("contrato-metodos")  // ← ADICIONAR ISTO
    private List<MetodoPagamento> metodosPagamento;
}
```

**No modelo MetodoPagamento.java:**
```java
@Entity
public class MetodoPagamento extends BaseEntity {
    // ... outros campos ...

    @ManyToOne
    @JoinColumn(name = "contrato_id")
    @JsonBackReference("contrato-metodos")  // ← ADICIONAR ISTO
    private Contrato contrato;

    @ManyToOne
    @JoinColumn(name = "servico_id")
    @JsonBackReference("servico-metodos")  // ← ADICIONAR ISTO
    private Servico servico;

    @ManyToOne
    @JoinColumn(name = "cliente_id")
    @JsonBackReference("cliente-metodos")  // ← ADICIONAR ISTO
    private Cliente cliente;
}
```

### Opção 2: Usar @JsonIgnoreProperties

**No modelo Contrato.java:**
```java
@Entity
public class Contrato extends BaseEntity {
    @OneToMany(mappedBy = "contrato")
    @JsonIgnoreProperties({"contrato", "servico", "cliente"})  // ← ADICIONAR
    private List<MetodoPagamento> metodosPagamento;
}
```

**No modelo MetodoPagamento.java:**
```java
@Entity
public class MetodoPagamento extends BaseEntity {
    @ManyToOne
    @JsonIgnoreProperties({"metodosPagamento"})  // ← ADICIONAR
    private Contrato contrato;

    @ManyToOne
    @JsonIgnoreProperties({"metodosPagamento"})  // ← ADICIONAR
    private Servico servico;

    @ManyToOne
    @JsonIgnoreProperties({"metodosPagamento", "contratos", "enderecos"})  // ← ADICIONAR
    private Cliente cliente;
}
```

### Opção 3: Usar DTOs (Mais Profissional)

Criar classes DTO separadas para evitar expor entidades JPA diretamente:

```java
// ContratoDTO.java
public class ContratoDTO {
    private Long id;
    private String descricao;
    private Double valor;
    private LocalDate dataVencimento;
    private StatusConta status;
    // NÃO incluir metodosPagamento aqui!
}

// ContratoController.java
@GetMapping
public List<ContratoDTO> listarTodos() {
    return contratoService.listarTodos()
        .stream()
        .map(this::toDTO)
        .collect(Collectors.toList());
}

private ContratoDTO toDTO(Contrato contrato) {
    ContratoDTO dto = new ContratoDTO();
    dto.setId(contrato.getId());
    dto.setDescricao(contrato.getDescricao());
    dto.setValor(contrato.getValor());
    // ... outros campos
    return dto;
}
```

## Verificar no Backend

1. **Abra o backend no RV-Project**
2. **Procure pelos arquivos:**
   - `Contrato.java`
   - `MetodoPagamento.java`
   - `Servico.java`
   - `Cliente.java`

3. **Adicione as anotações @JsonBackReference/@JsonManagedReference**

4. **Reinicie o backend**

5. **Teste no navegador:** `http://localhost:8080/api/servicos`
   - Deve retornar JSON válido
   - Tamanho deve ser pequeno (alguns KB, não MB)

## Endpoints Afetados

Todos os endpoints que retornam listas estão quebrados:

- ❌ `GET /api/servicos`
- ❌ `GET /api/contratos`
- ❌ `GET /api/metodos-pagamento`
- ❌ `GET /api/clientes`
- ❌ `GET /api/categorias`

## Como Testar a Correção

```bash
# Depois de corrigir o backend, teste com curl:
curl http://localhost:8080/api/servicos

# Deve retornar algo como:
[
  {
    "id": 1,
    "nome": "PIX",
    "descricao": "Pagamento instantâneo",
    "taxa": 0.0,
    "tipo": "TRANSFERENCIA",
    "ativo": true
  }
]

# NÃO deve ter loops infinitos ou erros de JSON
```

## Prioridade: 🔴 CRÍTICA

Sem essa correção, o frontend **NÃO FUNCIONA**. Nenhuma lista pode ser carregada.
