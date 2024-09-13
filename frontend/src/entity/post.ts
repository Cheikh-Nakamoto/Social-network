// export class Post {
//     id!: number
//     title!: string
//     content!: string
//     image?: string;
//     privacy!: string
//     user_id!: number
//     created_at!: Date
//     updated_at!: Date
// }
export class Post {
    id!: number;
    title!: string;
    content!: string;
    image?: string; // Ajoute cette ligne si elle manque
    group_id!: number;
    ispublic!: string;
    user_id!: number;
    created_at!: Date;
}
