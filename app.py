from flask import Flask, request, jsonify

app = Flask(__name__)

games = [
    {"title": "The Witcher 3", "genre": "RPG", "platform": "PC, PS5, Xbox", "multiplayer": "No", "difficulty": "Hardcore"},
    {"title": "Dark Souls III", "genre": "Action", "platform": "PC, PS4, Xbox", "multiplayer": "No", "difficulty": "Hardcore"},
    {"title": "Hollow Knight", "genre": "Metroidvania", "platform": "PC, Switch", "multiplayer": "No", "difficulty": "Normal"},
    {"title": "Cyberpunk 2077", "genre": "RPG", "platform": "PC, PS5, Xbox", "multiplayer": "No", "difficulty": "Normal"},
    {"title": "Doom Eternal", "genre": "FPS", "platform": "PC, PS5, Xbox", "multiplayer": "Yes", "difficulty": "Hardcore"},
]

@app.route('/recommend', methods=['POST'])
def recommend_games():
    user_input = request.json  
    genre = user_input.get('genre', None)
    platform = user_input.get('platform', None)
    multiplayer = user_input.get('multiplayer', None)
    difficulty = user_input.get('difficulty', None)

    filtered_games = [game for game in games if 
                      (not genre or game["genre"] == genre) and
                      (not platform or platform in game["platform"]) and
                      (not multiplayer or game["multiplayer"] == multiplayer) and
                      (not difficulty or game["difficulty"] == difficulty)]

    return jsonify(filtered_games[:5])

if __name__ == '__main__':
    app.run(debug=True)
 
