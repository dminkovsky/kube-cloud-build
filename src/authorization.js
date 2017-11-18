export default function authorization(token) {
    return {
        'Authorization': `Bearer ${token}`,
    };
}
