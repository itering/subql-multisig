# Query

## Multisig query

```sql

query {
  multisigAccounts(first: 10) {
    nodes {
      id
      confirmed {
        nodes {
          id
        }
      }
    }

  }
}
```

```sql

query {
  multisigAccount(id: "2qa8bEshNoLyWSzsiU6L3kVBDYaGGztQp7AfSMTqz2jyT1X2") {
    id
    confirmed {
      nodes {
        id
      }
    }
  }
}
```

```sql
query {
  ExecutedMultisigs(
    filter: {
      multisigAccountId: {
        equalTo: "2qa8bEshNoLyWSzsiU6L3kVBDYaGGztQp7AfSMTqz2jyT1X2"
      }
    }
  ) {
    totalCount
    nodes {
      id
    }
  }
}
```
