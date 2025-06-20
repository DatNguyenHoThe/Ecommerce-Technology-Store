import { useCartStore } from "@/stores/useCartStore";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";

import { ICartItem } from "@/app/types/types";

type QuantityInputProps = {
  item: ICartItem;
};

export default function QuantityInput({
  item
}: QuantityInputProps) {
  const [quantity, setQuantity] = useState<number>(item.quantity || 1);
  const updateItem = useCartStore((state) => state.updateItem);
  
  const increase = () => {
    const newQuantity = quantity + 1;
    setQuantity(newQuantity);
    updateItem(item.product._id, newQuantity);
  };

  const decrease = () => {
    if (quantity > 1) {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
      updateItem(item.product._id, newQuantity);
    }
  };

  return (
    <div className="flex justify-end">
      <button
        onClick={decrease}
        className={`w-8 h-8 border rounded-s flex items-center justify-center ${
          quantity === 1
            ? "border-gray-300 text-gray-300 disabled"
            : "border-[#CFCFCF] cursor-pointer"
        }`}
      >
        <Minus className="w-4"></Minus>
      </button>
      <input
        type="number"
        value={quantity}
        readOnly
        className="w-12 h-8 border border-y-[#CFCFCF] border-x-0 text-center outline-none appearance-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        onClick={increase}
        className="w-8 h-8 border border-[#CFCFCF] rounded-e flex items-center justify-center cursor-pointer"
      >
        <Plus className="w-4"></Plus>
      </button>
    </div>
  );
}
