/*eslint-disable*/
var AlldayMove = window.ne.dooray.calendar.AlldayMove;
describe('handler:AlldayMove', function() {
    var proto;

    beforeEach(function() {
        proto = AlldayMove.prototype;
    });

    describe('checkExpectedCondition()', function() {
        var mockTarget;

        beforeEach(function() {
            mockTarget = document.createElement('div');
        });

        it('check specific event session is suitable for handler.', function() {
            // 1. not suitable for handler.
            expect(proto.checkExpectedCondition(mockTarget)).toBe(false);

            mockTarget.className = '/* @echo CSS_PREFIX */allday-event';    // simulate click 'event' element block.
            // 2. but there is no parent element for export parent view instance.
            expect(proto.checkExpectedCondition(mockTarget)).toBe(false);

            var mockInst = {
                alldayView: {
                    childs: {
                        items: {
                            '3': 'success'
                        }
                    }
                }
            };

            var parentEl = document.createElement('div');
            parentEl.className = '/* @echo CSS_PREFIX */allday-monthweek';
            parentEl.appendChild(mockTarget);

            // 3. no instance ID information.
            expect(proto.checkExpectedCondition.call(mockInst, mockTarget)).toBe(false);

            // 4. good
            parentEl.className = '/* @echo CSS_PREFIX */allday-monthweek /* @echo CSS_PREFIX */3';
            expect(proto.checkExpectedCondition.call(mockInst, mockTarget)).toBe('success');
        });
    });

    describe('_updateEvent()', function() {
        var mockEventData,
            mockEventInstance,
            mockAlldayView,
            inst;

        beforeEach(function() {
            // 인스턴스 Mock
            inst = {
                baseController: jasmine.createSpyObj('baseController', ['updateEvent'])
            };

            // 5일짜리 주간 뷰 렌더링 Mock
            mockAlldayView = {
                options: {
                    renderStartDate: '2015-04-29',
                    renderEndDate: '2015-05-03'
                } 
            };
        });

        it('update event model properly by supplied event data.', function() {
            // 하루짜리 일정
            mockEventInstance = {
                cid: function() { return '30'; },
                starts: new Date('2015-04-30T00:00:00+09:00'),
                ends: new Date('2015-04-30T23:59:59+09:00')
            };

            // 이벤트 데이터 Mock
            // 오른쪽으로 한칸 옮겼다
            mockEventData = {
                targetModel: mockEventInstance,
                relatedView: mockAlldayView,
                dragStartXIndex: 1,
                xIndex: 2
            };

            proto._updateEvent.call(inst, mockEventData);

            // 하루 증가함
            expect(inst.baseController.updateEvent).toHaveBeenCalledWith('30', {
                starts: new Date('2015-05-01T00:00:00+09:00'),
                ends: new Date('2015-05-01T23:59:59+09:00')
            });

        });
    });

    describe('event handlers', function() {
        var inst,
            domutil;

        beforeEach(function() {
            domutil = window.ne.dooray.calendar.domutil;
            spyOn(domutil, 'closest');
            spyOn(domutil, 'getData');

            inst = new AlldayMove({on:function() {}});
            spyOn(inst, '_updateEvent');
        });

        describe('_onDragStart()', function() {
            it('cancel drag event when event session is not suitable for handler.', function() {
                spyOn(inst, 'checkExpectedCondition').and.returnValue(false);

                inst._onDragStart({});

                expect(domutil.closest).not.toHaveBeenCalled();
            });

            it('cancel drag event when model not exist that event session data.', function() {
                var mockController = {
                    events: {
                        items: {
                            '3': 'good'
                        }
                    }
                };

                var mockInst = {
                    baseController: mockController,
                    checkExpectedCondition: jasmine.createSpy('checkExpectedCondition'),
                    fire: jasmine.createSpy('fire')
                };

                // model instance not exist.
                mockInst.checkExpectedCondition.and.returnValue(true);
                domutil.getData.and.returnValue(2);
                proto._onDragStart.call(mockInst, {});

                expect(mockInst.fire).not.toHaveBeenCalled();
            });
        });
    });
});
