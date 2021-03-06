var express = require('express');
var router = express.Router();
var knex = require('../db/knex.js');


// add yo pet
router.get('/add', function(req, res, next) {
  if(req.cookies.user_id){
      res.render('petAdd', { cookie: req.cookies.user_id, username: req.cookies.username});
  } else {
    res.redirect('/')
  }
});

router.post('/add', function(req, res, next){
  knex.raw(`insert into pets values (default, ${req.body.user_id}, '${req.body.name}', '${req.body.species}', ${req.body.age}, '${req.body.bio}', '${req.body.temperament}', '${req.body.notes}', '${req.body.pic_url}') `)
  .then(function(data){
    res.cookie('alertCookie', 'Your pet was added', {maxAge : 5999});
    res.redirect(`/users/${req.cookies.user_id}`)
  })
})




// show pet
router.get('/:id', function(req, res, next) {
  knex.raw(`select pets.*, users.id as users_id, users.username, users.location from pets join users on pets.owner_id = users.id WHERE pets.id = ${req.params.id}`)
  .then(function(pets){
    knex.raw(`SELECT pet_reviews.*, users.username, users.id as user_id FROM pet_reviews JOIN users ON users.id = pet_reviews.poster_id WHERE pet_id = ${req.params.id}`)
    .then(function(reviews) {
        knex.raw(`select avg(rating) from pet_reviews where pet_id = ${req.params.id}`)
        .then(function(ave){
          knex.raw(`select * from pet_reviews where pet_id = ${req.params.id}`)
          .then(function(ratings){
            res.render('petShow', {pet: pets.rows[0], cookie: req.cookies.user_id, reviews: reviews.rows, starAve: Math.round(ave.rows[0].avg), username: req.cookies.username, ratings:ratings.rows, cookies: req.cookies.user_id});
          })


        })
      })
  })
});



// edit a pet
router.get('/:id/edit', function(req, res, next) {
    knex.raw(`select * from pets WHERE pets.id = ${req.params.id}`)
    .then(function(pets){
      res.render('petEdit', {
        pet:pets.rows[0], username: req.cookies.username, cookies: req.cookies.user_id })
    })
});



router.post('/:id/edit', function(req, res, next) {
    knex.raw(`update pets set pet_name='${req.body.name}', temperament='${req.body.temperament}', bio = '${req.body.bio}', age= ${req.body.age}, notes = '${req.body.notes}', pic_url = '${req.body.pic_url}' WHERE id = ${req.params.id}`)
    .then(function(pet){
      res.cookie('alertCookie', 'Your pet was edited', {maxAge : 5999});
      res.redirect(`/pets/${req.params.id}`)
    })
});






// delete a pet
router.post('/:id/delete', function(req, res, next) {
  knex.raw(`delete from pets where id = ${req.params.id}`)
  .then(function(data){
    res.cookie('alertCookie', 'Your pet was deleted', {maxAge : 5999});
    res.redirect(`/users/${req.cookies.user_id}`)
  })
});



// petDelete






module.exports = router;
