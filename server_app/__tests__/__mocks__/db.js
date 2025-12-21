export const getPool = jest.fn(() => ({
  request: () => ({
    input: () => ({
      query: jest.fn().mockResolvedValue({
        recordset: []
      })
    })
  })
}));
