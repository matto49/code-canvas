import { defineStore } from "pinia";
import { ref,computed} from 'vue'

export const useStore = defineStore('canvas', () =>{
	const isEditable = ref(false)
	const typeName = ref("")
	const dragType = ref("")
	return { isEditable, typeName, dragType}
})
