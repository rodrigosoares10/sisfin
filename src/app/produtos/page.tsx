'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MRRDashboard } from '@/components/mrr-dashboard'
import { formatCurrency } from '@/lib/utils'
import { ProductStats } from '@/types'

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<ProductStats[]>([])
  const [filteredProdutos, setFilteredProdutos] = useState<ProductStats[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'TODOS' | 'UNICO' | 'MRR'>('TODOS')

  useEffect(() => {
    fetchProdutos()
  }, [])

  useEffect(() => {
    if (filter === 'TODOS') {
      setFilteredProdutos(produtos)
    } else {
      setFilteredProdutos(produtos.filter(p => p.tipo === filter))
    }
  }, [filter, produtos])

  const fetchProdutos = async () => {
    try {
      const response = await fetch('/api/produtos')
      const data = await response.json()
      setProdutos(data)
      setFilteredProdutos(data)
    } catch (error) {
      console.error('Erro ao buscar produtos:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTipoColor = (tipo: string) => {
    return tipo === 'MRR' ? 'success' : 'secondary'
  }

  const getTipoLabel = (tipo: string) => {
    return tipo === 'MRR' ? 'Recorrente (MRR)' : 'Único'
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Produtos</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie seus produtos e acompanhe a receita recorrente
          </p>
        </div>
      </div>

      {/* MRR Dashboard */}
      <MRRDashboard />

      {/* Products Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista de Produtos</CardTitle>
              <CardDescription>
                Total de {filteredProdutos.length} produto(s)
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filter === 'TODOS' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('TODOS')}
              >
                Todos
              </Button>
              <Button
                variant={filter === 'MRR' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('MRR')}
              >
                MRR
              </Button>
              <Button
                variant={filter === 'UNICO' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('UNICO')}
              >
                Único
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando produtos...
            </div>
          ) : filteredProdutos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum produto encontrado
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Vendas</TableHead>
                  <TableHead className="text-right">Receita Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProdutos.map((produto) => (
                  <TableRow key={produto.id}>
                    <TableCell className="font-medium">{produto.nome}</TableCell>
                    <TableCell>
                      <Badge variant={getTipoColor(produto.tipo)}>
                        {getTipoLabel(produto.tipo)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(produto.valor)}
                      {produto.tipo === 'MRR' && (
                        <span className="text-xs text-muted-foreground ml-1">/mês</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={produto.ativo ? 'success' : 'destructive'}>
                        {produto.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col">
                        <span className="font-medium">{produto.salesCount}</span>
                        <span className="text-xs text-muted-foreground">transações</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col">
                        <span className="font-semibold text-green-600">
                          {formatCurrency(produto.totalRevenue)}
                        </span>
                        {produto.tipo === 'MRR' && produto.salesCount > 0 && (
                          <span className="text-xs text-muted-foreground">
                            Média: {formatCurrency(produto.totalRevenue / produto.salesCount)}/mês
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Produtos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{produtos.length}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {produtos.filter(p => p.ativo).length} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Produtos Recorrentes (MRR)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {produtos.filter(p => p.tipo === 'MRR').length}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {produtos.filter(p => p.tipo === 'MRR' && p.ativo).length} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Receita Total Gerada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(
                produtos.reduce((sum, p) => sum + p.totalRevenue, 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Todas as transações pagas
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
