import FavoriteModel from "../../Models/favorite.model.js";

// GET danh sách yêu thích theo user
export const index = async (req, res) => {
  const id_user = req.params.id;
  const data = await FavoriteModel.findByUser(id_user);
  res.json(data);
};

// POST thêm yêu thích
export const add = async (req, res) => {
  await FavoriteModel.create(req.body);
  res.send("Thanh Cong");
};

// DELETE bỏ yêu thích
export const remove = async (req, res) => {
  const { id_user, id_product } = req.body;
  await FavoriteModel.remove(id_user, id_product);
  res.send("Thanh Cong");
};
