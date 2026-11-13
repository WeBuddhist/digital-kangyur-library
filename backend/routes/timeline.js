const express = require('express');
const router = express.Router();
const timelineController = require('../controllers/timelineController');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @swagger
 * /timeline/periods:
 *   get:
 *     summary: Get timeline periods
 *     tags: [Timeline]
 *     parameters:
 *       - in: query
 *         name: lang
 *         schema:
 *           type: string
 *           default: en
 *         description: Language preference
 *     responses:
 *       200:
 *         description: Timeline periods retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 periods:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         $ref: '#/components/schemas/MultilingualTitle'
 *                       start_year:
 *                         type: integer
 *                       end_year:
 *                         type: integer
 */
router.get('/periods', timelineController.getTimelinePeriods);

/**
 * @swagger
 * /timeline/periods:
 *   post:
 *     summary: Create a timeline period
 *     tags: [Timeline]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name_english, start_year, end_year]
 *             properties:
 *               id_slug: { type: string }
 *               name_english: { type: string }
 *               name_tibetan: { type: string }
 *               description: { type: string }
 *               start_year: { type: integer }
 *               end_year: { type: integer }
 *     responses:
 *       201:
 *         description: Period created
 */
router.post('/periods', authenticate, authorize('admin', 'editor'), timelineController.createTimelinePeriod);

/**
 * @swagger
 * /timeline/periods/{id}:
 *   put:
 *     summary: Update a timeline period
 *     tags: [Timeline]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Period updated
 *   delete:
 *     summary: Delete a timeline period and all of its events
 *     tags: [Timeline]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Period deleted
 */
router.put('/periods/:id', authenticate, authorize('admin', 'editor'), timelineController.updateTimelinePeriod);
router.delete('/periods/:id', authenticate, authorize('admin'), timelineController.deleteTimelinePeriod);

/**
 * @swagger
 * /timeline/events:
 *   get:
 *     summary: Get timeline events
 *     tags: [Timeline]
 *     parameters:
 *       - in: query
 *         name: period_id
 *         schema:
 *           type: integer
 *         description: Filter by period ID
 *       - in: query
 *         name: lang
 *         schema:
 *           type: string
 *           default: en
 *         description: Language preference
 *       - in: query
 *         name: include_figures
 *         schema:
 *           type: string
 *           default: 'true'
 *         description: Include figures
 *       - in: query
 *         name: include_sources
 *         schema:
 *           type: string
 *           default: 'true'
 *         description: Include sources
 *       - in: query
 *         name: include_relations
 *         schema:
 *           type: string
 *           default: 'true'
 *         description: Include related events
 *     responses:
 *       200:
 *         description: Timeline events retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 events:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       period_id:
 *                         type: integer
 *                       title:
 *                         $ref: '#/components/schemas/MultilingualTitle'
 *                       description:
 *                         type: object
 *                       category:
 *                         type: string
 *                       year:
 *                         type: integer
 *                       century:
 *                         type: integer
 *                       era:
 *                         type: string
 */
router.get('/events', timelineController.getTimelineEvents);

/**
 * @swagger
 * /timeline/events/{id}:
 *   get:
 *     summary: Get timeline event by ID
 *     tags: [Timeline]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Event ID
 *       - in: query
 *         name: lang
 *         schema:
 *           type: string
 *           default: en
 *         description: Language preference
 *       - in: query
 *         name: include_figures
 *         schema:
 *           type: string
 *           default: 'true'
 *         description: Include figures
 *       - in: query
 *         name: include_sources
 *         schema:
 *           type: string
 *           default: 'true'
 *         description: Include sources
 *       - in: query
 *         name: include_relations
 *         schema:
 *           type: string
 *           default: 'true'
 *         description: Include related events
 *     responses:
 *       200:
 *         description: Timeline event retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 period_id:
 *                   type: integer
 *                 title:
 *                   $ref: '#/components/schemas/MultilingualTitle'
 *                 description:
 *                   type: object
 *                 category:
 *                   type: string
 *                 year:
 *                   type: integer
 *                 figures:
 *                   type: array
 *                 sources:
 *                   type: array
 *                 related_events:
 *                   type: array
 *       404:
 *         description: Event not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/events/:id', timelineController.getTimelineEventById);

/**
 * @swagger
 * /timeline/events:
 *   post:
 *     summary: Create a timeline event
 *     tags: [Timeline]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - period_id
 *               - title_tibetan
 *               - title_english
 *               - year
 *             properties:
 *               period_id:
 *                 type: integer
 *               title_tibetan:
 *                 type: string
 *               title_english:
 *                 type: string
 *               title_sanskrit:
 *                 type: string
 *               description_tibetan:
 *                 type: string
 *               description_english:
 *                 type: string
 *               category:
 *                 type: string
 *               year:
 *                 type: integer
 *               century:
 *                 type: integer
 *               era:
 *                 type: string
 *               is_approximate:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Event created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/events', authenticate, authorize('admin', 'editor'), timelineController.createTimelineEvent);

/**
 * @swagger
 * /timeline/events/{id}:
 *   put:
 *     summary: Update a timeline event
 *     tags: [Timeline]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Event ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               period_id:
 *                 type: integer
 *               title_tibetan:
 *                 type: string
 *               title_english:
 *                 type: string
 *               title_sanskrit:
 *                 type: string
 *               description_tibetan:
 *                 type: string
 *               description_english:
 *                 type: string
 *               category:
 *                 type: string
 *               year:
 *                 type: integer
 *               century:
 *                 type: integer
 *               era:
 *                 type: string
 *               is_approximate:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Event updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *       404:
 *         description: Event not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/events/:id', authenticate, authorize('admin', 'editor'), timelineController.updateTimelineEvent);

/**
 * @swagger
 * /timeline/events/{id}:
 *   delete:
 *     summary: Delete a timeline event
 *     tags: [Timeline]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Event not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/events/:id', authenticate, authorize('admin'), timelineController.deleteTimelineEvent);

module.exports = router;
