import axiosClient from './axiosClient'

const Product = {

    // Lấy tất cả sản phẩm
    Get_All_Product: () => {
        const url = '/api/Product'
        return axiosClient.get(url)
    },

    // Lấy sản phẩm theo category
    Get_Category_Product: (query) => {
        const url = `/api/Product/category${query}`
        return axiosClient.get(url)
    },

    // Lấy chi tiết sản phẩm
    Get_Detail_Product: (id) => {
        const url = `/api/Product/${id}`
        return axiosClient.get(url)
    },

    // 🔴 FIX LỖI Ở ĐÂY
    // ĐÚNG backend: /api/Category/gender
    Get_Category_Gender: (query) => {
        const url = `/api/Category/gender${query}`
        return axiosClient.get(url)
    },

    // Phân trang
    Get_Pagination: (query) => {
        const url = `/api/Product/category/pagination${query}`
        return axiosClient.get(url)
    },

    // Tìm kiếm
    get_search_list: (query) => {
        const url = `/api/Product/scoll/page${query}`
        return axiosClient.get(url)
    }

}

export default Product
